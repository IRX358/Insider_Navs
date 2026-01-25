from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from security import verify_password # whcih validates passwords
from sqlalchemy import select,update,insert,delete,func
from typing import Optional

import models, schemas
from database import get_db, async_engine
import heapq
import os

app = FastAPI(title="Insider Navs API")

# Configure CORS (Cross-Origin Resource Sharing) allowing React frontend to make requests to py fast backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Insider Navs API!"}

@app.get("/api/locations", response_model=list[schemas.Location])
async def get_locations(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.Location).order_by(models.Location.label))
        locations = result.scalars().all()
        return locations
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/faculty", response_model=list[schemas.Faculty])
async def get_faculty(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.Faculty).order_by(models.Faculty.name))
        faculty = result.scalars().all()
        return faculty
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/flash-news", response_model=list[schemas.FlashNews])
async def get_flash_news(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(models.FlashNews).order_by(models.FlashNews.id.desc()))
        news = result.scalars().all()
        return news
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error")

# IMPORTANT: This route must come BEFORE /api/faculty/{faculty_id}
# to avoid FastAPI trying to parse "live" as a faculty_id integer
@app.get("/api/faculty/live", response_model=list[schemas.FacultyLive])
async def get_faculty_live(ids: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """
    Get live faculty data (availability, unavailable_message)
    
    Args:
        ids: Optional comma-separated list of faculty IDs to filter
    """
    try:
        stmt = select(
            models.Faculty.id,
            models.Faculty.availability,
            models.Faculty.unavailable_message
        )
        
        # Filter by IDs if provided
        if ids:
            try:
                id_list = [int(id_str.strip()) for id_str in ids.split(',')]
                stmt = stmt.where(models.Faculty.id.in_(id_list))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid faculty IDs format")
        
        stmt = stmt.order_by(models.Faculty.id)
        result = await db.execute(stmt)
        
        # Convert to list of dicts
        live_data = []
        for row in result:
            live_data.append({
                'id': row[0],
                'availability': row[1],
                'unavailable_message': row[2]
            })
        
        return live_data
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching live faculty data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/api/faculty/{faculty_id}", response_model=schemas.Faculty)
async def get_faculty_by_id(faculty_id: int, db: AsyncSession = Depends(get_db)):
    try:
        stmt = select(models.Faculty).where(models.Faculty.id == faculty_id)
        result = await db.execute(stmt)
        faculty = result.scalar_one_or_none() # Get one or nthg

        if faculty is None:
            raise HTTPException(status_code=404, detail="Faculty not found")

        return faculty
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching faculty ID {faculty_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/admin/login", response_model=schemas.LoginResponse)
async def admin_login(login_data: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        stmt = select(models.AdminUser).where(models.AdminUser.username == login_data.username)
        result = await db.execute(stmt)
        admin_user = result.scalar_one_or_none() #one user or nthg

        if not admin_user:
            return schemas.LoginResponse(success=False, message="Invalid username or password")

        if not verify_password(login_data.password, admin_user.password):
            return schemas.LoginResponse(success=False, message="Invalid username or password")

        return schemas.LoginResponse(success=True, message="Login successful", username=admin_user.username)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error during login")

@app.post("/api/faculty/login", response_model=schemas.LoginResponse)
async def faculty_login(login_data: schemas.FacultyUsernameLogin, db: AsyncSession = Depends(get_db)):
    try:
        stmt = select(models.FacultyUser).where(models.FacultyUser.username == login_data.username.lower().strip())
        result = await db.execute(stmt)
        faculty_user = result.scalar_one_or_none()

        if not faculty_user:
            return schemas.LoginResponse(success=False, message="Invalid faculty user ID")

        # Verify the entered user ID against the hashed secure_user_id
        if not faculty_user.secure_user_id:
            return schemas.LoginResponse(success=False, message="Account not configured. Contact admin.")
        
        if not verify_password(login_data.username.lower().strip(), faculty_user.secure_user_id):
            return schemas.LoginResponse(success=False, message="Invalid faculty user ID")

        return schemas.LoginResponse(success=True, message="Login successful", faculty_id=faculty_user.faculty_id)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error during login")
    

# PUT Update Faculty Availability
@app.put("/api/faculty/{faculty_id}/availability", response_model=schemas.Faculty)
async def update_faculty_availability(
    faculty_id: int,
    availability_update: schemas.FacultyAvailabilityUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Check if faculty exists
        get_stmt = select(models.Faculty).where(models.Faculty.id == faculty_id)
        result = await db.execute(get_stmt)
        db_faculty = result.scalar_one_or_none()
        if db_faculty is None:
            raise HTTPException(status_code=404, detail="Faculty not found")

        # 2. Update the availability
        update_stmt = (
            update(models.Faculty)
            .where(models.Faculty.id == faculty_id)
            .values(availability=availability_update.availability)
            .returning(models.Faculty) # Return the updated record
        )
        updated_result = await db.execute(update_stmt)
        await db.commit() # Save changes to the database
        updated_faculty = updated_result.scalar_one() # Get the single updated row

        return updated_faculty
    except HTTPException as http_exc:
        await db.rollback() # Rollback changes if error
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error updating availability for faculty ID {faculty_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# PUT Update Faculty Profile
@app.put("/api/faculty/{faculty_id}", response_model=schemas.Faculty)
async def update_faculty_profile(
    faculty_id: int,
    profile_update: schemas.FacultyProfileUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Check if faculty exists
        get_stmt = select(models.Faculty).where(models.Faculty.id == faculty_id)
        result = await db.execute(get_stmt)
        db_faculty = result.scalar_one_or_none()
        if db_faculty is None:
            raise HTTPException(status_code=404, detail="Faculty not found")

        # 2. Create a dictionary of fields to update, excluding None values
        update_data = profile_update.model_dump(exclude_unset=True)

        if not update_data:
             raise HTTPException(status_code=400, detail="No update data provided")

        # 3. Perform the update
        update_stmt = (
            update(models.Faculty)
            .where(models.Faculty.id == faculty_id)
            .values(**update_data) # Use dictionary unpacking
            .returning(models.Faculty)
        )
        updated_result = await db.execute(update_stmt)
        await db.commit()
        updated_faculty = updated_result.scalar_one()

        return updated_faculty
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error updating profile for faculty ID {faculty_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# POST Create a new Location
@app.post("/api/locations", response_model=schemas.Location, status_code=201) # 201 Created
async def create_location(location_data: schemas.LocationCreate, db: AsyncSession = Depends(get_db)):
    try:
        get_stmt = select(models.Location).where(models.Location.id == location_data.id)
        existing = await db.execute(get_stmt)
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Location ID '{location_data.id}' already exists.")

        insert_stmt = (
            insert(models.Location)
            .values(**location_data.model_dump())
            .returning(models.Location) 
        )
        result = await db.execute(insert_stmt)
        await db.commit()
        new_location = result.scalar_one()
        return new_location
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error creating location: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# PUT Update an existing Location
@app.put("/api/locations/{location_id}", response_model=schemas.Location)
async def update_location(
    location_id: str,
    location_update: schemas.LocationUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        get_stmt = select(models.Location).where(models.Location.id == location_id)
        result = await db.execute(get_stmt)
        db_location = result.scalar_one_or_none()
        if db_location is None:
            raise HTTPException(status_code=404, detail="Location not found")

        update_data = location_update.model_dump(exclude_unset=True)
        if not update_data:
             raise HTTPException(status_code=400, detail="No update data provided")

        update_stmt = (
            update(models.Location)
            .where(models.Location.id == location_id)
            .values(**update_data)
            .returning(models.Location)
        )
        updated_result = await db.execute(update_stmt)
        await db.commit()
        updated_location = updated_result.scalar_one()

        return updated_location
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error updating location ID {location_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# DELETE a Location
@app.delete("/api/locations/{location_id}", response_model=schemas.DeleteResponse)
async def delete_location(location_id: str, db: AsyncSession = Depends(get_db)):
    try:
        get_stmt = select(models.Location).where(models.Location.id == location_id)
        result = await db.execute(get_stmt)
        db_location = result.scalar_one_or_none()
        if db_location is None:
            raise HTTPException(status_code=404, detail="Location not found")

        delete_stmt = delete(models.Location).where(models.Location.id == location_id)
        await db.execute(delete_stmt)
        await db.commit()

        return schemas.DeleteResponse(success=True, message="Location deleted successfully")
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        # Check for foreign key violation (ro check if a faculty uses this location)
        if "violates foreign key constraint" in str(e).lower():
             await db.rollback()
             raise HTTPException(status_code=400, detail="Cannot delete location: It is currently assigned to one or more faculty members.")
        await db.rollback()
        print(f"Error deleting location ID {location_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# POST Create new Faculty
@app.post("/api/faculty", response_model=schemas.Faculty, status_code=201)
async def create_faculty(faculty_data: schemas.FacultyCreate, db: AsyncSession = Depends(get_db)):
    try:
        if faculty_data.location_id:
            loc_stmt = select(models.Location).where(models.Location.id == faculty_data.location_id)
            loc_result = await db.execute(loc_stmt)
            if not loc_result.scalar_one_or_none():
                 raise HTTPException(status_code=400, detail=f"Location ID '{faculty_data.location_id}' does not exist.")

        # Insert new faculty member
        insert_stmt = (
            insert(models.Faculty)
            .values(**faculty_data.model_dump())
            .returning(models.Faculty)
        )
        result = await db.execute(insert_stmt)
        await db.commit()
        new_faculty = result.scalar_one()
        return new_faculty
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error creating faculty: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# DELETE Faculty
@app.delete("/api/faculty/{faculty_id}", response_model=schemas.DeleteResponse)
async def delete_faculty(faculty_id: int, db: AsyncSession = Depends(get_db)):
    try:
        get_stmt = select(models.Faculty).where(models.Faculty.id == faculty_id)
        result = await db.execute(get_stmt)
        db_faculty = result.scalar_one_or_none()
        if db_faculty is None:
            raise HTTPException(status_code=404, detail="Faculty not found")

        # 2. Delete the faculty member
        # The ON DELETE CASCADE in the faculty_users table definition should chumma handle this.
        delete_stmt = delete(models.Faculty).where(models.Faculty.id == faculty_id)
        await db.execute(delete_stmt)
        await db.commit()

        return schemas.DeleteResponse(success=True, message="Faculty member deleted successfully")
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        # just incasse handling potential foreign key issues if needed, though CASCADE should work
        print(f"Error deleting faculty ID {faculty_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# POST Create new Flash News item
@app.post("/api/flash-news", response_model=schemas.FlashNews, status_code=201)
async def create_flash_news(news_data: schemas.FlashNewsCreate, db: AsyncSession = Depends(get_db)):
    try:
        if not news_data.message or not news_data.message.strip():
             raise HTTPException(status_code=400, detail="News message cannot be empty.")

        insert_stmt = (
            insert(models.FlashNews)
            .values(message=news_data.message.strip())
            .returning(models.FlashNews)
        )
        result = await db.execute(insert_stmt)
        await db.commit()
        new_news = result.scalar_one()
        return new_news
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error creating flash news: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# DELETE Flash News item
@app.delete("/api/flash-news/{news_id}", response_model=schemas.DeleteResponse)
async def delete_flash_news(news_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Check if news item exists
        get_stmt = select(models.FlashNews).where(models.FlashNews.id == news_id)
        result = await db.execute(get_stmt)
        db_news = result.scalar_one_or_none()
        if db_news is None:
            raise HTTPException(status_code=404, detail="Flash news item not found")

        # 2. Delete the news item
        delete_stmt = delete(models.FlashNews).where(models.FlashNews.id == news_id)
        await db.execute(delete_stmt)
        await db.commit()

        return schemas.DeleteResponse(success=True, message="Flash news item deleted successfully")
    except HTTPException as http_exc:
        await db.rollback()
        raise http_exc
    except Exception as e:
        await db.rollback()
        print(f"Error deleting flash news ID {news_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
# GET Analytics Data
@app.get("/api/analytics", response_model=schemas.AnalyticsData)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    try:
        # total faculty count
        total_faculty_stmt = select(func.count(models.Faculty.id))
        total_faculty_res = await db.execute(total_faculty_stmt)
        total_faculty = total_faculty_res.scalar_one_or_none() or 0

        # total locations count
        total_locations_stmt = select(func.count(models.Location.id))
        total_locations_res = await db.execute(total_locations_stmt)
        total_locations = total_locations_res.scalar_one_or_none() or 0

        # available faculty count
        available_faculty_stmt = select(func.count(models.Faculty.id)).where(models.Faculty.availability == True)
        available_faculty_res = await db.execute(available_faculty_stmt)
        available_faculty = available_faculty_res.scalar_one_or_none() or 0

        #available HODs count
        available_hods_stmt = select(func.count(models.Faculty.id)).where(
            models.Faculty.availability == True,
            models.Faculty.role == 'HOD'
        )
        available_hods_res = await db.execute(available_hods_stmt)
        available_hods = available_hods_res.scalar_one_or_none() or 0

        # available CCs count
        available_ccs_stmt = select(func.count(models.Faculty.id)).where(
            models.Faculty.availability == True,
            models.Faculty.role == 'CC'
        )
        available_ccs_res = await db.execute(available_ccs_stmt)
        available_ccs = available_ccs_res.scalar_one_or_none() or 0

        # cal unavailable faculty
        unavailable_faculty = total_faculty - available_faculty

        #  response object
        analytics_data = schemas.AnalyticsData(
            total_faculty=total_faculty,
            total_locations=total_locations, 
            available_faculty=available_faculty,
            unavailable_faculty=unavailable_faculty,
            available_hods=available_hods,
            available_ccs=available_ccs
        )
        return analytics_data

    except Exception as e:
        print(f"Error fetching analytics data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error fetching analytics")

# ---- Pathfinding Logic ----

@app.get("/api/route/{from_id}/{to_id}", response_model=schemas.RouteResponse)
async def get_route(from_id: str, to_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Fetch all edges and locations
        edges_result = await db.execute(select(models.Edge))
        edges = edges_result.scalars().all()
        
        locs_result = await db.execute(select(models.Location))
        locations = {loc.id: loc.label for loc in locs_result.scalars().all()}

        if from_id not in locations or to_id not in locations:
            raise HTTPException(status_code=404, detail="Start or end location not found")

        # 2. Build adjacency list
        graph = {}
        for edge in edges:
            if edge.from_location_id not in graph:
                graph[edge.from_location_id] = []
            graph[edge.from_location_id].append({
                "to": edge.to_location_id,
                "distance": edge.distance,
                "instruction": edge.direction_text
            })

        # 3. Dijkstra's Algorithm
        distances = {loc_id: float('inf') for loc_id in locations}
        distances[from_id] = 0
        pq = [(0, from_id)]
        previous_nodes = {} # To reconstruct path
        edge_info = {} # To store instructions

        while pq:
            current_distance, current_node = heapq.heappop(pq)

            if current_distance > distances[current_node]:
                continue
            
            if current_node == to_id:
                break

            for neighbor in graph.get(current_node, []):
                distance = current_distance + neighbor["distance"]
                if distance < distances[neighbor["to"]]:
                    distances[neighbor["to"]] = distance
                    previous_nodes[neighbor["to"]] = current_node
                    edge_info[(current_node, neighbor["to"])] = neighbor
                    heapq.heappush(pq, (distance, neighbor["to"]))

        if distances[to_id] == float('inf'):
            raise HTTPException(status_code=404, detail="No route found between these locations")

        # 4. Reconstruct Path and Steps
        path = []
        steps = []
        curr = to_id
        while curr in previous_nodes:
            prev = previous_nodes[curr]
            info = edge_info[(prev, curr)]
            steps.insert(0, schemas.RouteStep(
                instruction=info["instruction"],
                distance=info["distance"],
                to_label=locations[curr]
            ))
            path.insert(0, curr)
            curr = prev
        path.insert(0, from_id)

        return schemas.RouteResponse(
            total_distance=int(distances[to_id]),
            steps=steps,
            path=path
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error calculating route: {e}")
        raise HTTPException(status_code=500, detail="Internal server error calculating route")


# ================================
# Snapshot & Live Data Endpoints
# ================================

@app.get("/api/meta/snapshot-version", response_model=schemas.SnapshotVersion)
async def get_snapshot_version(db: AsyncSession = Depends(get_db)):
    """Get the current snapshot version for client-side sync"""
    try:
        stmt = select(models.SnapshotMeta).where(
            models.SnapshotMeta.key == 'faculty_static_version'
        )
        result = await db.execute(stmt)
        meta = result.scalar_one_or_none()
        
        if meta is None:
            # Return default version if no snapshot exists yet
            return schemas.SnapshotVersion(version="none")
        
        return schemas.SnapshotVersion(version=meta.value)
    except Exception as e:
        print(f"Error fetching snapshot version: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/snapshots/{filename}")
async def serve_snapshot(filename: str):
    """Serve Parquet snapshot files"""
    try:
        # Security: validate filename to prevent directory traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        # Only allow .parquet files
        if not filename.endswith('.parquet'):
            raise HTTPException(status_code=400, detail="Only Parquet files are allowed")
        
        snapshot_dir = os.path.join(os.path.dirname(__file__), "snapshots")
        filepath = os.path.join(snapshot_dir, filename)
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Snapshot file not found")
        
        return FileResponse(
            filepath,
            media_type="application/octet-stream",
            filename=filename
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error serving snapshot: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/admin/regenerate-snapshot", response_model=schemas.SnapshotGenerationResult)
async def regenerate_snapshot(db: AsyncSession = Depends(get_db)):
    """
    Admin endpoint to trigger snapshot regeneration
    Note: In production, this should be protected with admin authentication
    """
    try:
        # Import the generator function
        from snapshot_generator import generate_snapshot
        
        # Generate new snapshot
        result = generate_snapshot()
        
        return schemas.SnapshotGenerationResult(
            success=True,
            message="Snapshot generated successfully",
            version=result['version'],
            filename=result['filename'],
            row_count=result['row_count'],
            file_size_kb=result['file_size_kb']
        )
    except Exception as e:
        print(f"Error regenerating snapshot: {e}")
        import traceback
        traceback.print_exc()
        return schemas.SnapshotGenerationResult(
            success=False,
            message=f"Failed to generate snapshot: {str(e)}"
        )
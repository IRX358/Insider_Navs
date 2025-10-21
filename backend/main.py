from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from security import verify_password # whcih validates passwords
from sqlalchemy import select,update,insert,delete,func

import models, schemas
from database import get_db, async_engine

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
            return schemas.LoginResponse(success=False, message="Invalid faculty username")

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
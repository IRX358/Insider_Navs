"""
Snapshot Generator for Faculty Data

This script extracts static and rarely-changing faculty data from PostgreSQL
and generates a versioned Parquet snapshot for client-side querying via DuckDB WASM.

Usage:
    python snapshot_generator.py
"""

import os
import hashlib
from datetime import datetime
from sqlalchemy import create_engine, select, update
from sqlalchemy.orm import Session
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

# Import models
import models
from settings import settings

# Define column groups
STATIC_COLS = [
    "id", "name", "department", "school", "designation",
    "role", "cabin_number", "phone_number", "location_id"
]

RARE_COLS = [
    "courses_taken", "mon", "tue", "wed", "thu", "fri"
]

ALL_SNAPSHOT_COLS = STATIC_COLS + RARE_COLS

# Snapshot directory
SNAPSHOT_DIR = os.path.join(os.path.dirname(__file__), "snapshots")


def generate_version_hash(data: pd.DataFrame) -> str:
    """Generate a hash of the data for versioning"""
    # Create hash from data shape and first/last rows
    data_str = f"{len(data)}_{data.columns.tolist()}"
    if len(data) > 0:
        data_str += str(data.iloc[0].to_dict()) + str(data.iloc[-1].to_dict())
    return hashlib.md5(data_str.encode()).hexdigest()[:8]


def generate_snapshot() -> dict:
    """
    Extract faculty data and generate Parquet snapshot
    
    Returns:
        dict: Contains 'version', 'filename', 'row_count', 'file_size'
    """
    # Ensure snapshot directory exists
    os.makedirs(SNAPSHOT_DIR, exist_ok=True)
    
    # Create synchronous engine for this script
    sync_db_url = settings.DATABASE_URL_ASYNC.replace('+asyncpg', '').replace('postgresql+asyncpg', 'postgresql')
    engine = create_engine(sync_db_url)
    
    print(" Extracting faculty data from PostgreSQL...")
    
    # Query faculty data
    with Session(engine) as session:
        # Build query to select only needed columns
        stmt = select(
            models.Faculty.id,
            models.Faculty.name,
            models.Faculty.department,
            models.Faculty.school,
            models.Faculty.designation,
            models.Faculty.role,
            models.Faculty.cabin_number,
            models.Faculty.phone_number,
            models.Faculty.location_id,
            models.Faculty.courses_taken,
            models.Faculty.mon,
            models.Faculty.tue,
            models.Faculty.wed,
            models.Faculty.thu,
            models.Faculty.fri,
        ).order_by(models.Faculty.id)
        
        result = session.execute(stmt)
        rows = result.fetchall()
        
        # Convert to DataFrame
        df = pd.DataFrame(rows, columns=ALL_SNAPSHOT_COLS)
        
        print(f" Extracted {len(df)} faculty records")
        
        # Generate version
        year_month = datetime.now().strftime("%Y_%m")
        data_hash = generate_version_hash(df)
        version = f"{year_month}_{data_hash}"
        filename = f"faculty_static_{version}.parquet"
        filepath = os.path.join(SNAPSHOT_DIR, filename)
        
        print(f"📦 Generating Parquet snapshot: {filename}")
        
        # Convert to Arrow Table and write Parquet
        table = pa.Table.from_pandas(df)
        pq.write_table(
            table,
            filepath,
            compression="zstd",
            compression_level=3,  # Balance between compression ratio and speed
        )
        
        file_size = os.path.getsize(filepath)
        file_size_kb = file_size / 1024
        
        print(f"✅ Snapshot created: {file_size_kb:.2f} KB")
        
        # Update snapshot_meta table
        print(" Updating snapshot metadata in database...")
        
        # Check if snapshot_meta table exists and create if needed
        from sqlalchemy import inspect
        inspector = inspect(engine)
        if 'snapshot_meta' not in inspector.get_table_names():
            print("  Creating snapshot_meta table...")
            models.Base.metadata.create_all(engine, tables=[models.SnapshotMeta.__table__])
        
        # Upsert version
        stmt = select(models.SnapshotMeta).where(
            models.SnapshotMeta.key == 'faculty_static_version'
        )
        existing = session.execute(stmt).scalar_one_or_none()
        
        if existing:
            stmt = (
                update(models.SnapshotMeta)
                .where(models.SnapshotMeta.key == 'faculty_static_version')
                .values(value=version)
            )
            session.execute(stmt)
        else:
            new_meta = models.SnapshotMeta(
                key='faculty_static_version',
                value=version
            )
            session.add(new_meta)
        
        session.commit()
        print(f" Snapshot version updated: {version}")
        
        return {
            'version': version,
            'filename': filename,
            'row_count': len(df),
            'file_size': file_size,
            'file_size_kb': round(file_size_kb, 2)
        }


if __name__ == "__main__":
    try:
        print(" Starting Faculty Snapshot Generation")
        print("=" * 50)
        
        result = generate_snapshot()
        
        print("=" * 50)
        print("✨ Snapshot Generation Complete!")
        print(f"   Version: {result['version']}")
        print(f"   Filename: {result['filename']}")
        print(f"   Records: {result['row_count']}")
        print(f"   Size: {result['file_size_kb']} KB")
        
    except Exception as e:
        print(f"❌ Error generating snapshot: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

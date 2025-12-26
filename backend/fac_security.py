"""
Faculty Security Script - Hashes all faculty usernames and updates secure_user_id column.

Run this script once to populate the hashed user IDs for all existing faculty users.
Usage: python fac_security.py
"""

import asyncio
from sqlalchemy import select, update
from database import AsyncSessionLocal
import models
from security import get_password_hash

async def hash_all_faculty_usernames():
    """
    Fetches all faculty_users, hashes their usernames, 
    and updates the secure_user_id column with the hash.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Fetch all faculty users
            result = await session.execute(select(models.FacultyUser))
            faculty_users = result.scalars().all()
            
            if not faculty_users:
                print("No faculty users found in the database.")
                return
            
            print(f"Found {len(faculty_users)} faculty user(s). Starting hash process...\n")
            
            for user in faculty_users:
                # Hash the username
                hashed_id = get_password_hash(user.username)
                
                # Update the secure_user_id column
                update_stmt = (
                    update(models.FacultyUser)
                    .where(models.FacultyUser.id == user.id)
                    .values(secure_user_id=hashed_id)
                )
                await session.execute(update_stmt)
                
                print(f"✓ Hashed user: {user.username} (faculty_id: {user.faculty_id})")
            
            # Commit all changes
            await session.commit()
            print(f"\n✅ Successfully hashed and updated {len(faculty_users)} faculty user(s)!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error during hashing process: {e}")
            raise

if __name__ == "__main__":
    print("=" * 50)
    print("Faculty User ID Hashing Script")
    print("=" * 50 + "\n")
    asyncio.run(hash_all_faculty_usernames())

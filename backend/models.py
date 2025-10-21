from sqlalchemy import Column, Integer, String, Boolean, Text, ARRAY, ForeignKey
from database import Base

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Text, primary_key=True)
    label = Column(Text, nullable=False)
    subtitle = Column(Text)
    type = Column(Text, default='location')

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    department = Column(Text)
    school = Column(Text)
    designation = Column(Text)
    role = Column(Text)
    courses_taken = Column(ARRAY(Text))
    cabin_number = Column(Text)
    phone_number = Column(Text)
    availability = Column(Boolean, default=False)
    location_id = Column(Text, ForeignKey("locations.id"))

class FlashNews(Base):
    __tablename__ = "flash_news"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    message = Column(Text, nullable=False)
    
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False) # Stores the HASHED password

class FacultyUser(Base):
    __tablename__ = "faculty_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, unique=True, nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), unique=True)
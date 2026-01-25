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
    # Timetable columns: 8-char string, '1'=busy, '0'=free for each period
    mon = Column(Text, default='00000000')
    tue = Column(Text, default='00000000')
    wed = Column(Text, default='00000000')
    thu = Column(Text, default='00000000')
    fri = Column(Text, default='00000000')
    unavailable_message = Column(Text)  # Custom message when unavailable

class FlashNews(Base):
    __tablename__ = "flash_news"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    message = Column(Text, nullable=False)
    
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)  # Stores the HASHED password

class FacultyUser(Base):
    __tablename__ = "faculty_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(Text, unique=True, nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), unique=True)
    secure_user_id = Column(Text)  # Stores the HASHED user ID for secure login

class Edge(Base):
    __tablename__ = "edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    from_location_id = Column(Text, ForeignKey("locations.id"), nullable=False)
    to_location_id = Column(Text, ForeignKey("locations.id"), nullable=False)
    distance = Column(Integer, nullable=False)
    direction_text = Column(Text, nullable=False)

class SnapshotMeta(Base):
    __tablename__ = "snapshot_meta"
    
    key = Column(Text, primary_key=True)
    value = Column(Text, nullable=False)
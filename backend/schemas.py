from pydantic import BaseModel
from typing import List, Optional

# ---- FlashNews Schemas ----
class FlashNewsBase(BaseModel):
    message: str

class FlashNews(FlashNewsBase):
    id: int
    
    class Config:
        orm_mode = True # Tells Pydantic to read data from ORM models

# ---- Location Schemas ----
class LocationBase(BaseModel):
    id: str
    label: str
    subtitle: Optional[str] = None
    type: Optional[str] = 'location'

class Location(LocationBase):
    
    class Config:
        orm_mode = True

# ---- Faculty Schemas ----
class FacultyBase(BaseModel):
    name: str
    department: Optional[str] = None
    school: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    courses_taken: Optional[List[str]] = []
    cabin_number: Optional[str] = None
    phone_number: Optional[str] = None
    availability: bool
    location_id: Optional[str] = None
    # Timetable fields
    mon: Optional[str] = '00000000'
    tue: Optional[str] = '00000000'
    wed: Optional[str] = '00000000'
    thu: Optional[str] = '00000000'
    fri: Optional[str] = '00000000'
    unavailable_message: Optional[str] = None

class Faculty(FacultyBase):
    id: int
    
    class Config:
        orm_mode = True

# ---- Login Schemas ----
class UserLogin(BaseModel):
    username: str
    password: str # For Admin login

class FacultyUsernameLogin(BaseModel):
    username: str # For Faculty login 

# ---- Response Schemas ----
class LoginResponse(BaseModel):
    success: bool
    message: str
    username: Optional[str] = None # For successful Admin login
    faculty_id: Optional[int] = None # For successful Faculty login

# Schema for updating just the availability
class FacultyAvailabilityUpdate(BaseModel):
    availability: bool

# Schema for updating the main profile fields
# All fields are optional because the teacher might only change one thing
class FacultyProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    cabin_number: Optional[str] = None
    phone_number: Optional[str] = None
    courses_taken: Optional[List[str]] = None
    unavailable_message: Optional[str] = None  # Custom unavailable message

# Schema for CREATING a location 
class LocationCreate(BaseModel):
    id: str 
    label: str
    subtitle: Optional[str] = None
    type: Optional[str] = 'location'

class LocationUpdate(BaseModel):
    label: Optional[str] = None
    subtitle: Optional[str] = None
    type: Optional[str] = 'location'

class DeleteResponse(BaseModel):
    success: bool
    message: str

# Schema for CREATING faculty
class FacultyCreate(BaseModel):
    name: str
    department: Optional[str] = None
    school: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    courses_taken: Optional[List[str]] = []
    cabin_number: Optional[str] = None
    phone_number: Optional[str] = None
    availability: bool = True 
    location_id: Optional[str] = None # Make sure this location_id exists!

# Schema for CREATING flash news
class FlashNewsCreate(BaseModel):
    message: str 

# Schema for Analytics Data
class AnalyticsData(BaseModel):
    total_faculty: int
    total_locations: int 
    available_faculty: int
    unavailable_faculty: int
    available_hods: int
    available_ccs: int

# ---- Pathfinding Schemas ----
class EdgeBase(BaseModel):
    from_location_id: str
    to_location_id: str
    distance: int
    direction_text: str

class Edge(EdgeBase):
    id: int
    class Config:
        orm_mode = True

class RouteStep(BaseModel):
    instruction: str
    distance: int
    to_label: str

class RouteResponse(BaseModel):
    total_distance: int
    steps: List[RouteStep]
    path: List[str] # List of location IDs
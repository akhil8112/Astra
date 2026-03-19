from typing import Optional, List
from sqlmodel import Field, SQLModel, JSON, Column

class Provider(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: str # "Therapist" or "Doctor"
    location: str
    description: str
    specialties: List[str] = Field(sa_column=Column(JSON))

class Ngo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    position: dict = Field(sa_column=Column(JSON)) # e.g., {"lat": 30.73, "lng": 76.77}

class LibraryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    type: str  # "Article", "Guide", "Video"
    description: str
    tags: List[str] = Field(sa_column=Column(JSON))

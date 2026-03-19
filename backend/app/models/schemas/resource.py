from sqlmodel import SQLModel
from typing import List

class Position(SQLModel):
    lat: float
    lng: float

class ProviderPublic(SQLModel):
    id: int
    name: str
    type: str
    location: str
    description: str
    specialties: List[str]

class NgoPublic(SQLModel):
    id: int
    name: str
    description: str
    position: Position

class LibraryItemPublic(SQLModel):
    id: int
    title: str
    type: str
    description: str
    tags: List[str]

class PaginationInfo(SQLModel):
    currentPage: int
    totalPages: int
    totalItems: int

class PaginatedLibraryItems(SQLModel):
    data: List[LibraryItemPublic]
    pagination: PaginationInfo

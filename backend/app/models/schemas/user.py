from sqlmodel import SQLModel, Field 
# Schema for receiving data when creating a user (from the frontend)
# This matches the frontend's request body.
class UserCreate(SQLModel):
    email: str
    password: str = Field(min_length=8, max_length=72)
    username: str # Changed from 'name' in frontend spec for consistency

# Schema for sending data back to the frontend (our API's response)
# Note: It does NOT include the password.
class UserPublic(SQLModel):
    id: int
    username: str
    email: str
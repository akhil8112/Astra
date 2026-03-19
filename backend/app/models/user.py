from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Relationship

# This forward reference is needed for the relationship
if TYPE_CHECKING:
    from .forum import Post, Comment

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # These relationships connect the user to their posts and comments
    posts: List["Post"] = Relationship(back_populates="author")
    comments: List["Comment"] = Relationship(back_populates="author")
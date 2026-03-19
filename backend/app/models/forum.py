from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Relationship, JSON, Column

# This forward reference is needed for the relationship
if TYPE_CHECKING:
    from .user import User

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    tags: List[str] = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    author_id: int = Field(foreign_key="user.id")
    
    author: "User" = Relationship(back_populates="posts")
    comments: List["Comment"] = Relationship(back_populates="post")

class Comment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    author_id: int = Field(foreign_key="user.id")
    post_id: int = Field(foreign_key="post.id")

    author: "User" = Relationship(back_populates="comments")
    post: "Post" = Relationship(back_populates="comments")
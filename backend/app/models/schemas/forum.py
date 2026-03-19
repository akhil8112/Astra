from sqlmodel import SQLModel
from typing import List
from datetime import datetime
from .user import UserPublic # Import the existing UserPublic schema

# Schemas for creating new content
class PostCreate(SQLModel):
    title: str
    content: str
    tags: List[str]

class CommentCreate(SQLModel):
    text: str

# Schema for displaying a single comment (includes author details)
class CommentPublic(SQLModel):
    id: int
    text: str
    created_at: datetime
    author: UserPublic

# Schema for the main forum page (list of posts)
# Includes author details and comment count, but only an excerpt of the content
class PostPublic(SQLModel):
    id: int
    title: str
    excerpt: str
    tags: List[str]
    created_at: datetime
    author: UserPublic
    replies: int

# Schema for the post detail page (full content and list of comments)
class PostPublicWithComments(SQLModel):
    id: int
    title: str
    content: str
    tags: List[str]
    created_at: datetime
    author: UserPublic
    comments: List[CommentPublic]
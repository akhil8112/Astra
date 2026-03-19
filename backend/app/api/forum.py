import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Annotated, List
from sqlmodel import Session, select, func

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.user import User
from app.models.forum import Post, Comment
from app.models.schemas.forum import PostCreate, CommentCreate, PostPublic, PostPublicWithComments, CommentPublic

router = APIRouter(prefix="/forum", tags=["Forum"])

@router.get("/posts", response_model=List[PostPublic])
def get_all_posts(
    session: Annotated[Session, Depends(get_session)],
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0),
):
    """
    Fetch a paginated list of all forum posts.
    """
    offset = (page - 1) * limit
    posts = session.exec(select(Post).offset(offset).limit(limit)).all()

    # We need to manually create the public models to include the reply count and excerpt
    posts_public = []
    for post in posts:
        posts_public.append(
            PostPublic(
                id=post.id,
                title=post.title,
                excerpt=post.content[:100] + "...", # Create a short excerpt
                tags=post.tags,
                created_at=post.created_at,
                author=post.author,
                replies=len(post.comments) # Get the number of comments
            )
        )
    return posts_public

@router.post("/posts", response_model=PostPublicWithComments, status_code=status.HTTP_201_CREATED)
def create_post(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    post_in: PostCreate
):
    """
    Create a new forum post.
    """
    post = Post.model_validate(post_in, update={"author_id": current_user.id})
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.get("/posts/{post_id}", response_model=PostPublicWithComments)
def get_post_by_id(
    session: Annotated[Session, Depends(get_session)],
    post_id: int
):
    """
    Fetch a single post by its ID, including all comments.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post

@router.post("/posts/{post_id}/comments", response_model=CommentPublic, status_code=status.HTTP_201_CREATED)
def create_comment_for_post(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    post_id: int,
    comment_in: CommentCreate
):
    """
    Add a new comment to a specific post.
    """
    # First, ensure the post exists
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = Comment.model_validate(comment_in, update={"author_id": current_user.id, "post_id": post_id})
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment
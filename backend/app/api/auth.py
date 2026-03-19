from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import hash_password
from app.models.user import User
from app.models.schemas.user import UserCreate, UserPublic

from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token
from typing import Annotated # Use Annotated for FastAPI v0.95.1+

# Create a new router for authentication endpoints
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(*, session: Session = Depends(get_session), user_in: UserCreate):
    """
    Create a new user.
    """
    # Check if a user with the same email or username already exists
    existing_user = session.exec(
        select(User).where(
            (User.email == user_in.email) | (User.username == user_in.username)
        )
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email or username already exists.",
        )

    # Hash the password before creating the user object
    hashed_pwd = hash_password(user_in.password)
    
    # Create a new User object from the input schema
    # We use .model_dump() to convert the Pydantic model to a dict
    user = User.model_validate(user_in, update={"hashed_password": hashed_pwd})
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user

@router.post("/login/token")
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    """
    Authenticate user and return a JWT access token.
    """
    # 1. Find the user by username
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    
    # 2. Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Create and return the access token
    access_token = create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}
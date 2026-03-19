from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session
from app.models.user import User
from fastapi import Query, WebSocket


# This tells FastAPI where to look for the token (in the "Authorization" header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login/token")
def get_current_user(
    session: Annotated[Session, Depends(get_session)], 
    token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    """
    Decodes the JWT token to get the current user.
    This function is a dependency that can be used in any protected endpoint.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user

# --- ADD THIS FUNCTION TO THE END OF YOUR deps.py FILE ---

def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Dependency to get the current user and check if they are active.
    This re-uses the get_current_user dependency above.
    """
    # We will add logic here later if we add an 'is_active' field to the User model.
    # For now, if the user exists, we consider them active.
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_user_from_token(
    token: Annotated[str, Query()], # Extracts 'token' from ?token=...
    session: Annotated[Session, Depends(get_session)]
) -> User:
    """
    Dependency to get the current user from a token in the query string.
    Specifically for WebSocket authentication.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials from token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user

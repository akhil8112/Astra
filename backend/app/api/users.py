from fastapi import APIRouter, Depends
from typing import Annotated

from app.api.deps import get_current_user
from app.models.user import User
from app.models.schemas.user import UserPublic

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Fetch the profile of the currently logged-in user.
    """
    return current_user
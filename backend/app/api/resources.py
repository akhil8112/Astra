import math
from fastapi import APIRouter, Depends, HTTPException, Query # <-- Added 'Query' here
from typing import Annotated, List, Optional
from sqlmodel import Session, select, func # <-- Added 'func' here

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.user import User
from app.models.resource import Provider, Ngo, LibraryItem
from app.models.schemas.resource import ProviderPublic, NgoPublic, LibraryItemPublic, PaginatedLibraryItems

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.get("/providers", response_model=List[ProviderPublic])
def get_providers(
    session: Annotated[Session, Depends(get_session)],
    type: Optional[str] = None
):
    """
    Fetch a list of professionals, optionally filtering by type.
    """
    query = select(Provider)
    if type:
        query = query.where(Provider.type == type)
    providers = session.exec(query).all()
    return providers

@router.get("/ngos", response_model=List[NgoPublic])
def get_ngos(
    session: Annotated[Session, Depends(get_session)],
):
    """

    Fetch the list of NGOs for the map view.
    """
    ngos = session.exec(select(Ngo)).all()
    return ngos

@router.get("/library", response_model=PaginatedLibraryItems)
def get_library_items(
    session: Annotated[Session, Depends(get_session)],
    page: int = Query(1, gt=0),
    limit: int = Query(10, gt=0),
    search: Optional[str] = None,
    challenge: Optional[str] = None,
    age: Optional[str] = None,
):
    """
    Fetch, filter, and paginate items from the Resource Library.
    """
    query = select(LibraryItem)
    
    # Apply filters
    if search:
        query = query.where(LibraryItem.title.ilike(f"%{search}%"))
    if challenge:
        query = query.where(LibraryItem.tags.contains([challenge]))
    if age:
        query = query.where(LibraryItem.tags.contains([age]))

    # Get total count for pagination
    count_query = select(func.count()).select_from(query.order_by(None))
    total_items = session.exec(count_query).one()
    
    # Apply pagination
    offset = (page - 1) * limit
    items = session.exec(query.offset(offset).limit(limit)).all()
    
    # Calculate total pages
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 0

    return PaginatedLibraryItems(
        data=items,
        pagination={
            "currentPage": page,
            "totalPages": total_pages,
            "totalItems": total_items
        }
    )
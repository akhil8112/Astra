from fastapi import APIRouter, Depends
from typing import Annotated, List

from app.api.deps import get_current_user
from app.models.user import User
from app.models.schemas.dashboard import (
    DashboardStats, ProgressDataPoint, StoryWeaverRequest, StoryWeaverResponse,
    ScreenerResult, ActivitiesThisWeek, CompletionRate, StoryStep
)
from app.services.generative_ai import generate_story_from_gemini

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Fetch the three main stat cards for the user's dashboard.
    (Currently returns mock data)
    """
    # TODO: Replace with real data queries
    return DashboardStats(
        screenerResult=ScreenerResult(level="Medium", lastAssessed="2025-09-24T10:00:00Z"),
        activitiesThisWeek=ActivitiesThisWeek(count=27, change=3),
        completionRate=CompletionRate(rate=0.82, period="weekly")
    )

@router.get("/progress", response_model=List[ProgressDataPoint])
def get_progress_chart_data(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Fetch activity data for the weekly progress chart.
    (Currently returns mock data)
    """
    # TODO: Replace with real data queries
    return [
        ProgressDataPoint(date="Mon", completed=4, skipped=1),
        ProgressDataPoint(date="Tue", completed=3, skipped=2),
        ProgressDataPoint(date="Wed", completed=5, skipped=0),
        ProgressDataPoint(date="Thu", completed=4, skipped=0),
        ProgressDataPoint(date="Fri", completed=6, skipped=1),
        ProgressDataPoint(date="Sat", completed=2, skipped=3),
        ProgressDataPoint(date="Sun", completed=3, skipped=1),
    ]


@router.post("/story-weaver", response_model=StoryWeaverResponse)
def generate_social_story(
    story_request: StoryWeaverRequest,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Takes a situation and returns a generated social story from the Gemini API.
    """
    # Replace the mock data with a call to our new service
    return generate_story_from_gemini(situation=story_request.situation)
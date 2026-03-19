from sqlmodel import SQLModel
from typing import List

# Schemas for Stats Endpoint
class ScreenerResult(SQLModel):
    level: str
    lastAssessed: str

class ActivitiesThisWeek(SQLModel):
    count: int
    change: int

class CompletionRate(SQLModel):
    rate: float
    period: str

class DashboardStats(SQLModel):
    screenerResult: ScreenerResult
    activitiesThisWeek: ActivitiesThisWeek
    completionRate: CompletionRate

# Schema for Progress Chart Endpoint
class ProgressDataPoint(SQLModel):
    date: str
    completed: int
    skipped: int

# Schemas for Story Weaver Endpoint
class StoryWeaverRequest(SQLModel):
    situation: str

class StoryStep(SQLModel):
    text: str
    illustration: str

class StoryWeaverResponse(SQLModel):
    situation: str
    steps: List[StoryStep]
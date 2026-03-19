from sqlmodel import SQLModel
from typing import List

class ScreenerSubmitRequest(SQLModel):
    name: str
    age: int
    sex: str
    ethnicity: str
    jaundice: bool  # <-- ADD THIS
    family_asd: bool # <-- ADD THIS
    answers: List[int]

# This is the data we will return to the frontend
class ScreenerSubmitResponse(SQLModel):
    riskLevel: str
    analysisSummary: str
    confidenceScore: float | None
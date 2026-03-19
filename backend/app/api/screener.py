import httpx
from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated

from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.schemas.screener import ScreenerSubmitRequest, ScreenerSubmitResponse

router = APIRouter(prefix="/screener", tags=["Screener"])

@router.post("/submit", response_model=ScreenerSubmitResponse)
async def submit_screener(
    screener_data: ScreenerSubmitRequest,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Receives screener data from a logged-in user, gets a prediction
    from the ML service, and returns the analysis.
    """
    # --- START DEBUG BLOCK ---
    # Let's see the exact payload we're about to send to the ML service
    payload_to_ml = screener_data.model_dump()
    print("--- DEBUG: Payload being sent to ML service ---")
    print(payload_to_ml)
    print("---------------------------------------------")
    # --- END DEBUG BLOCK ---

    # Call our ML microservice
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.DDS_SERVICE_URL,
                json=payload_to_ml, # Use the variable we just printed
                timeout=30.0
            )
            response.raise_for_status()
            ml_result = response.json()
    
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Error calling ML service: {exc}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

    # Map the ML service's response to our frontend's required format
    confidence = ml_result.get("probability")
    summary = f"The model predicted a {ml_result.get('label', 'N/A')} with a score of {ml_result.get('score', 'N/A')}."

    return ScreenerSubmitResponse(
        riskLevel=ml_result.get("label", "Error"),
        analysisSummary=summary,
        confidenceScore=confidence
    )
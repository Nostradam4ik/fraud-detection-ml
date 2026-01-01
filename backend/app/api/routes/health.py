"""Health check endpoint"""

from datetime import datetime

from fastapi import APIRouter

from ...models.schemas import HealthResponse
from ...models.ml_model import fraud_model
from ...core.config import settings

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check if the API is running and model is loaded",
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint for monitoring and load balancers.
    Returns the API status and whether the ML model is loaded.
    """
    return HealthResponse(
        status="healthy",
        model_loaded=fraud_model.is_loaded,
        version=settings.app_version,
        timestamp=datetime.now(),
    )

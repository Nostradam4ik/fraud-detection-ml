"""Analytics and statistics endpoints"""

from typing import Dict

from fastapi import APIRouter, HTTPException

from ...models.schemas import ModelInfo, StatsResponse
from ...models.ml_model import fraud_model
from ...services.fraud_detector import FraudDetectorService

router = APIRouter()


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Get API usage statistics",
    description="Get statistics about API usage and predictions",
)
async def get_stats() -> StatsResponse:
    """
    Get API usage statistics including:
    - Total predictions made
    - Fraud detection count
    - Average response time
    - API uptime
    """
    return FraudDetectorService.get_stats()


@router.get(
    "/model",
    response_model=ModelInfo,
    summary="Get model information",
    description="Get details about the ML model",
)
async def get_model_info() -> ModelInfo:
    """
    Get information about the fraud detection model including:
    - Model type and version
    - Training data statistics
    - Performance metrics (accuracy, precision, recall, F1, ROC-AUC)
    """
    if not fraud_model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure the model files exist.",
        )

    return FraudDetectorService.get_model_info()


@router.get(
    "/features",
    response_model=Dict[str, float],
    summary="Get feature importance",
    description="Get the importance score for each feature",
)
async def get_feature_importance() -> Dict[str, float]:
    """
    Get feature importance scores from the model.
    Higher scores indicate more important features for fraud detection.
    """
    if not fraud_model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure the model files exist.",
        )

    try:
        return FraudDetectorService.get_feature_importance()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting feature importance: {str(e)}"
        )

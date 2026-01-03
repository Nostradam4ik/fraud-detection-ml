"""Prediction endpoints"""

from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...models.schemas import (
    TransactionInput,
    PredictionResponse,
    BatchPredictionInput,
    BatchPredictionResponse,
    UserResponse,
)
from ...models.ml_model import fraud_model
from ...services.fraud_detector import FraudDetectorService
from ...services.data_processor import DataProcessor
from ...services.auth_service import get_current_user
from ...services.prediction_service import save_prediction, get_user_predictions, get_user_prediction_stats
from ...db.database import get_db

router = APIRouter()


@router.post(
    "",
    response_model=PredictionResponse,
    summary="Predict fraud for a single transaction",
    description="Analyze a transaction and predict if it's fraudulent. Requires authentication.",
)
async def predict_fraud(
    transaction: TransactionInput,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PredictionResponse:
    """
    Predict if a single transaction is fraudulent.

    - **time**: Seconds elapsed since first transaction in dataset
    - **v1-v28**: PCA transformed features (anonymized)
    - **amount**: Transaction amount

    Returns prediction with probability, confidence level, and risk score.
    """
    if not fraud_model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure the model files exist.",
        )

    try:
        result = FraudDetectorService.predict_single(transaction)

        # Save prediction to database
        save_prediction(db, int(current_user.id), transaction, result)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post(
    "/batch",
    response_model=BatchPredictionResponse,
    summary="Predict fraud for multiple transactions",
    description="Analyze multiple transactions in a single request. Requires authentication.",
)
async def predict_fraud_batch(
    batch: BatchPredictionInput,
    current_user: UserResponse = Depends(get_current_user)
) -> BatchPredictionResponse:
    """
    Predict fraud for multiple transactions at once.

    Maximum 1000 transactions per batch.
    Returns summary statistics and individual predictions.
    """
    if not fraud_model.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure the model files exist.",
        )

    try:
        return FraudDetectorService.predict_batch(batch.transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@router.get(
    "/history",
    summary="Get prediction history",
    description="Get the authenticated user's prediction history.",
)
async def get_history(
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[dict]:
    """Get the user's prediction history from database."""
    predictions = get_user_predictions(db, int(current_user.id), limit=limit)

    return [
        {
            "id": p.id,
            "time": p.time,
            "amount": p.amount,
            "is_fraud": p.is_fraud,
            "fraud_probability": p.fraud_probability,
            "confidence": p.confidence,
            "risk_score": p.risk_score,
            "prediction_time_ms": p.prediction_time_ms,
            "created_at": p.created_at.isoformat()
        }
        for p in predictions
    ]


@router.get(
    "/stats",
    summary="Get user prediction stats",
    description="Get prediction statistics for the authenticated user.",
)
async def get_stats(
    current_user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Get the user's prediction statistics."""
    return get_user_prediction_stats(db, int(current_user.id))


@router.get(
    "/sample/legitimate",
    response_model=Dict,
    summary="Get sample legitimate transaction",
    description="Generate a sample transaction that is likely legitimate",
)
async def get_sample_legitimate() -> Dict:
    """Get a sample transaction with typical legitimate patterns for testing."""
    return DataProcessor.generate_sample_transaction(is_fraud=False)


@router.get(
    "/sample/fraud",
    response_model=Dict,
    summary="Get sample fraudulent transaction",
    description="Generate a sample transaction that is likely fraudulent",
)
async def get_sample_fraud() -> Dict:
    """Get a sample transaction with typical fraud patterns for testing."""
    return DataProcessor.generate_sample_transaction(is_fraud=True)

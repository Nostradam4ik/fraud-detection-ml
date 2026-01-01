"""Prediction endpoints"""

from typing import Dict

from fastapi import APIRouter, HTTPException

from ...models.schemas import (
    TransactionInput,
    PredictionResponse,
    BatchPredictionInput,
    BatchPredictionResponse,
)
from ...models.ml_model import fraud_model
from ...services.fraud_detector import FraudDetectorService
from ...services.data_processor import DataProcessor

router = APIRouter()


@router.post(
    "",
    response_model=PredictionResponse,
    summary="Predict fraud for a single transaction",
    description="Analyze a transaction and predict if it's fraudulent",
)
async def predict_fraud(transaction: TransactionInput) -> PredictionResponse:
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
        return FraudDetectorService.predict_single(transaction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post(
    "/batch",
    response_model=BatchPredictionResponse,
    summary="Predict fraud for multiple transactions",
    description="Analyze multiple transactions in a single request",
)
async def predict_fraud_batch(
    batch: BatchPredictionInput,
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

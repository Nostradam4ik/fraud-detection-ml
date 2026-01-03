"""
Prediction Service - Save and retrieve predictions from database

Author: Zhmuryk Andrii
Copyright (c) 2024 - All Rights Reserved
"""

import json
from typing import List, Optional

from sqlalchemy.orm import Session

from ..db.models import Prediction
from ..models.schemas import TransactionInput, PredictionResponse


def save_prediction(
    db: Session,
    user_id: int,
    transaction: TransactionInput,
    result: PredictionResponse
) -> Prediction:
    """Save a prediction to the database"""

    # Convert PCA features to JSON
    features = {
        f"v{i}": getattr(transaction, f"v{i}")
        for i in range(1, 29)
    }

    db_prediction = Prediction(
        user_id=user_id,
        time=transaction.time,
        amount=transaction.amount,
        features_json=json.dumps(features),
        is_fraud=result.is_fraud,
        fraud_probability=result.fraud_probability,
        confidence=result.confidence,
        risk_score=result.risk_score,
        prediction_time_ms=result.prediction_time_ms
    )

    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction


def get_user_predictions(
    db: Session,
    user_id: int,
    limit: int = 50,
    offset: int = 0
) -> List[Prediction]:
    """Get predictions for a specific user"""
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_user_prediction_stats(db: Session, user_id: int) -> dict:
    """Get prediction statistics for a user"""
    predictions = db.query(Prediction).filter(Prediction.user_id == user_id).all()

    if not predictions:
        return {
            "total_predictions": 0,
            "fraud_detected": 0,
            "legitimate_detected": 0,
            "fraud_rate": 0.0,
            "average_response_time_ms": 0.0
        }

    total = len(predictions)
    fraud_count = sum(1 for p in predictions if p.is_fraud)
    legitimate_count = total - fraud_count
    avg_time = sum(p.prediction_time_ms for p in predictions) / total

    return {
        "total_predictions": total,
        "fraud_detected": fraud_count,
        "legitimate_detected": legitimate_count,
        "fraud_rate": fraud_count / total if total > 0 else 0.0,
        "average_response_time_ms": avg_time
    }


def get_prediction_by_id(db: Session, prediction_id: int) -> Optional[Prediction]:
    """Get a specific prediction by ID"""
    return db.query(Prediction).filter(Prediction.id == prediction_id).first()

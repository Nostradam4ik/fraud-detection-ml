"""Pydantic schemas for API request/response validation"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TransactionInput(BaseModel):
    """Input schema for a single transaction prediction"""

    # Time elapsed since first transaction in dataset (in seconds)
    time: float = Field(..., ge=0, description="Seconds elapsed since first transaction")

    # PCA transformed features V1-V28 (anonymized for privacy)
    v1: float = Field(..., description="PCA feature V1")
    v2: float = Field(..., description="PCA feature V2")
    v3: float = Field(..., description="PCA feature V3")
    v4: float = Field(..., description="PCA feature V4")
    v5: float = Field(..., description="PCA feature V5")
    v6: float = Field(..., description="PCA feature V6")
    v7: float = Field(..., description="PCA feature V7")
    v8: float = Field(..., description="PCA feature V8")
    v9: float = Field(..., description="PCA feature V9")
    v10: float = Field(..., description="PCA feature V10")
    v11: float = Field(..., description="PCA feature V11")
    v12: float = Field(..., description="PCA feature V12")
    v13: float = Field(..., description="PCA feature V13")
    v14: float = Field(..., description="PCA feature V14")
    v15: float = Field(..., description="PCA feature V15")
    v16: float = Field(..., description="PCA feature V16")
    v17: float = Field(..., description="PCA feature V17")
    v18: float = Field(..., description="PCA feature V18")
    v19: float = Field(..., description="PCA feature V19")
    v20: float = Field(..., description="PCA feature V20")
    v21: float = Field(..., description="PCA feature V21")
    v22: float = Field(..., description="PCA feature V22")
    v23: float = Field(..., description="PCA feature V23")
    v24: float = Field(..., description="PCA feature V24")
    v25: float = Field(..., description="PCA feature V25")
    v26: float = Field(..., description="PCA feature V26")
    v27: float = Field(..., description="PCA feature V27")
    v28: float = Field(..., description="PCA feature V28")

    # Transaction amount
    amount: float = Field(..., ge=0, description="Transaction amount")

    class Config:
        json_schema_extra = {
            "example": {
                "time": 0.0,
                "v1": -1.359807,
                "v2": -0.072781,
                "v3": 2.536347,
                "v4": 1.378155,
                "v5": -0.338321,
                "v6": 0.462388,
                "v7": 0.239599,
                "v8": 0.098698,
                "v9": 0.363787,
                "v10": 0.090794,
                "v11": -0.551600,
                "v12": -0.617801,
                "v13": -0.991390,
                "v14": -0.311169,
                "v15": 1.468177,
                "v16": -0.470401,
                "v17": 0.207971,
                "v18": 0.025791,
                "v19": 0.403993,
                "v20": 0.251412,
                "v21": -0.018307,
                "v22": 0.277838,
                "v23": -0.110474,
                "v24": 0.066928,
                "v25": 0.128539,
                "v26": -0.189115,
                "v27": 0.133558,
                "v28": -0.021053,
                "amount": 149.62,
            }
        }


class PredictionResponse(BaseModel):
    """Response schema for a single prediction"""

    is_fraud: bool = Field(..., description="Whether the transaction is predicted as fraud")
    fraud_probability: float = Field(
        ..., ge=0, le=1, description="Probability of fraud (0-1)"
    )
    confidence: str = Field(..., description="Confidence level: low, medium, high")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score (0-100)")
    prediction_time_ms: float = Field(..., description="Prediction time in milliseconds")

    class Config:
        json_schema_extra = {
            "example": {
                "is_fraud": False,
                "fraud_probability": 0.02,
                "confidence": "high",
                "risk_score": 2,
                "prediction_time_ms": 5.23,
            }
        }


class BatchPredictionInput(BaseModel):
    """Input schema for batch predictions"""

    transactions: List[TransactionInput] = Field(
        ..., min_length=1, max_length=1000, description="List of transactions to predict"
    )


class SingleBatchResult(BaseModel):
    """Single result in batch prediction"""

    index: int
    is_fraud: bool
    fraud_probability: float
    risk_score: int


class BatchPredictionResponse(BaseModel):
    """Response schema for batch predictions"""

    total_transactions: int
    fraud_count: int
    legitimate_count: int
    fraud_rate: float
    results: List[SingleBatchResult]
    processing_time_ms: float


class ModelInfo(BaseModel):
    """Information about the ML model"""

    model_name: str = "Random Forest Classifier"
    model_version: str = "1.0.0"
    features_count: int = 30
    training_samples: int = 284807
    fraud_samples: int = 492
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    last_trained: Optional[datetime] = None


class StatsResponse(BaseModel):
    """API usage statistics"""

    total_predictions: int
    fraud_detected: int
    legitimate_detected: int
    fraud_rate: float
    average_response_time_ms: float
    uptime_seconds: float


class HealthResponse(BaseModel):
    """Health check response"""

    status: str = "healthy"
    model_loaded: bool
    version: str
    timestamp: datetime


# ============== Authentication Schemas ==============

class UserCreate(BaseModel):
    """Schema for user registration"""

    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    full_name: Optional[str] = Field(None, description="Full name")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (without password)"""

    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "user_123",
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login"""

    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "password": "securepassword123"
            }
        }


class Token(BaseModel):
    """Schema for JWT token response"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration time in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600
            }
        }


class TokenData(BaseModel):
    """Schema for decoded token data"""

    username: Optional[str] = None
    user_id: Optional[str] = None

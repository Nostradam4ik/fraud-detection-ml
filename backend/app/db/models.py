"""
Database Models - SQLAlchemy ORM Models

Author: Zhmuryk Andrii
Copyright (c) 2024 - All Rights Reserved
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    """User model for authentication"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to predictions
    predictions = relationship("Prediction", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class Prediction(Base):
    """Prediction history model"""

    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Transaction data
    time = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)

    # PCA features stored as JSON string
    features_json = Column(Text, nullable=False)

    # Prediction results
    is_fraud = Column(Boolean, nullable=False)
    fraud_probability = Column(Float, nullable=False)
    confidence = Column(String(20), nullable=False)
    risk_score = Column(Integer, nullable=False)
    prediction_time_ms = Column(Float, nullable=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to user
    user = relationship("User", back_populates="predictions")

    def __repr__(self):
        return f"<Prediction(id={self.id}, is_fraud={self.is_fraud}, probability={self.fraud_probability})>"

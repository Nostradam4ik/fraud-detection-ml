"""
Database Configuration - SQLite with SQLAlchemy

Author: Zhmuryk Andrii
Copyright (c) 2024 - All Rights Reserved
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL (file-based)
SQLALCHEMY_DATABASE_URL = "sqlite:///./fraud_detection.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize the database (create tables)"""
    Base.metadata.create_all(bind=engine)

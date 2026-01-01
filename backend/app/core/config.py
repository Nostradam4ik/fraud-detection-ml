"""Application configuration using Pydantic Settings"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "Fraud Detection API"
    app_version: str = "1.0.0"
    debug: bool = False

    # API
    api_v1_prefix: str = "/api/v1"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # ML Model paths
    model_path: str = "models/fraud_detector.pkl"
    scaler_path: str = "models/scaler.pkl"

    # Logging
    log_level: str = "INFO"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

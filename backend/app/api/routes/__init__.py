"""API Routes"""

from fastapi import APIRouter

from .prediction import router as prediction_router
from .analytics import router as analytics_router
from .health import router as health_router

router = APIRouter()

# Include all route modules
router.include_router(prediction_router, prefix="/predict", tags=["Predictions"])
router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
router.include_router(health_router, tags=["Health"])

"""Tests for API endpoints"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.data_processor import DataProcessor

client = TestClient(app)


class TestHealthEndpoint:
    """Tests for health check endpoint"""

    def test_health_check(self):
        """Test health endpoint returns 200"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "timestamp" in data
        assert "model_loaded" in data


class TestRootEndpoint:
    """Tests for root endpoint"""

    def test_root(self):
        """Test root endpoint returns API info"""
        response = client.get("/")
        assert response.status_code == 200

        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "docs" in data


class TestPredictionEndpoints:
    """Tests for prediction endpoints"""

    def test_sample_legitimate(self):
        """Test sample legitimate transaction endpoint"""
        response = client.get("/api/v1/predict/sample/legitimate")
        assert response.status_code == 200

        data = response.json()
        assert "time" in data
        assert "amount" in data
        assert "v1" in data
        assert "v28" in data

    def test_sample_fraud(self):
        """Test sample fraud transaction endpoint"""
        response = client.get("/api/v1/predict/sample/fraud")
        assert response.status_code == 200

        data = response.json()
        assert "time" in data
        assert "amount" in data


class TestAnalyticsEndpoints:
    """Tests for analytics endpoints"""

    def test_stats(self):
        """Test stats endpoint"""
        response = client.get("/api/v1/analytics/stats")
        assert response.status_code == 200

        data = response.json()
        assert "total_predictions" in data
        assert "fraud_detected" in data
        assert "legitimate_detected" in data
        assert "fraud_rate" in data
        assert "uptime_seconds" in data


class TestDataProcessor:
    """Tests for data processor"""

    def test_generate_sample_legitimate(self):
        """Test generating legitimate transaction sample"""
        sample = DataProcessor.generate_sample_transaction(is_fraud=False)

        assert "time" in sample
        assert "amount" in sample
        assert "v1" in sample
        assert sample["amount"] >= 0

    def test_generate_sample_fraud(self):
        """Test generating fraud transaction sample"""
        sample = DataProcessor.generate_sample_transaction(is_fraud=True)

        assert "time" in sample
        assert "amount" in sample
        # Fraud transactions typically have higher amounts
        assert sample["amount"] >= 0


class TestInputValidation:
    """Tests for input validation"""

    def test_invalid_transaction_missing_fields(self):
        """Test that missing fields return 422"""
        response = client.post(
            "/api/v1/predict",
            json={"time": 0, "amount": 100},  # Missing V1-V28
        )
        assert response.status_code == 422

    def test_invalid_negative_amount(self):
        """Test that negative amount returns 422"""
        sample = DataProcessor.generate_sample_transaction()
        sample["amount"] = -100

        response = client.post("/api/v1/predict", json=sample)
        assert response.status_code == 422

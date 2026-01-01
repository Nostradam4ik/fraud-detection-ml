"""Data preprocessing utilities"""

from typing import List

import numpy as np

from ..models.schemas import TransactionInput


class DataProcessor:
    """Process and transform transaction data for ML model"""

    @staticmethod
    def transaction_to_array(transaction: TransactionInput) -> np.ndarray:
        """Convert a TransactionInput to numpy array for model prediction"""
        return np.array([
            transaction.time,
            transaction.v1,
            transaction.v2,
            transaction.v3,
            transaction.v4,
            transaction.v5,
            transaction.v6,
            transaction.v7,
            transaction.v8,
            transaction.v9,
            transaction.v10,
            transaction.v11,
            transaction.v12,
            transaction.v13,
            transaction.v14,
            transaction.v15,
            transaction.v16,
            transaction.v17,
            transaction.v18,
            transaction.v19,
            transaction.v20,
            transaction.v21,
            transaction.v22,
            transaction.v23,
            transaction.v24,
            transaction.v25,
            transaction.v26,
            transaction.v27,
            transaction.v28,
            transaction.amount,
        ])

    @staticmethod
    def transactions_to_batch(transactions: List[TransactionInput]) -> np.ndarray:
        """Convert list of transactions to numpy array for batch prediction"""
        return np.array([
            DataProcessor.transaction_to_array(t) for t in transactions
        ])

    @staticmethod
    def generate_sample_transaction(is_fraud: bool = False) -> dict:
        """Generate a sample transaction for testing"""
        np.random.seed(42 if not is_fraud else 123)

        if is_fraud:
            # Fraud transactions often have unusual V patterns
            return {
                "time": float(np.random.uniform(0, 172792)),
                "v1": float(np.random.uniform(-5, -2)),
                "v2": float(np.random.uniform(2, 5)),
                "v3": float(np.random.uniform(-5, -2)),
                "v4": float(np.random.uniform(2, 5)),
                "v5": float(np.random.uniform(-3, 3)),
                "v6": float(np.random.uniform(-3, 3)),
                "v7": float(np.random.uniform(-5, -2)),
                "v8": float(np.random.uniform(-3, 3)),
                "v9": float(np.random.uniform(-3, 3)),
                "v10": float(np.random.uniform(-5, -2)),
                "v11": float(np.random.uniform(-3, 3)),
                "v12": float(np.random.uniform(-5, -2)),
                "v13": float(np.random.uniform(-3, 3)),
                "v14": float(np.random.uniform(-5, -2)),
                "v15": float(np.random.uniform(-3, 3)),
                "v16": float(np.random.uniform(-5, -2)),
                "v17": float(np.random.uniform(-5, -2)),
                "v18": float(np.random.uniform(-3, 3)),
                "v19": float(np.random.uniform(-3, 3)),
                "v20": float(np.random.uniform(-3, 3)),
                "v21": float(np.random.uniform(-3, 3)),
                "v22": float(np.random.uniform(-3, 3)),
                "v23": float(np.random.uniform(-3, 3)),
                "v24": float(np.random.uniform(-3, 3)),
                "v25": float(np.random.uniform(-3, 3)),
                "v26": float(np.random.uniform(-3, 3)),
                "v27": float(np.random.uniform(-3, 3)),
                "v28": float(np.random.uniform(-3, 3)),
                "amount": float(np.random.uniform(500, 2000)),
            }
        else:
            # Normal transaction patterns
            return {
                "time": float(np.random.uniform(0, 172792)),
                "v1": float(np.random.normal(0, 1)),
                "v2": float(np.random.normal(0, 1)),
                "v3": float(np.random.normal(0, 1)),
                "v4": float(np.random.normal(0, 1)),
                "v5": float(np.random.normal(0, 1)),
                "v6": float(np.random.normal(0, 1)),
                "v7": float(np.random.normal(0, 1)),
                "v8": float(np.random.normal(0, 1)),
                "v9": float(np.random.normal(0, 1)),
                "v10": float(np.random.normal(0, 1)),
                "v11": float(np.random.normal(0, 1)),
                "v12": float(np.random.normal(0, 1)),
                "v13": float(np.random.normal(0, 1)),
                "v14": float(np.random.normal(0, 1)),
                "v15": float(np.random.normal(0, 1)),
                "v16": float(np.random.normal(0, 1)),
                "v17": float(np.random.normal(0, 1)),
                "v18": float(np.random.normal(0, 1)),
                "v19": float(np.random.normal(0, 1)),
                "v20": float(np.random.normal(0, 1)),
                "v21": float(np.random.normal(0, 1)),
                "v22": float(np.random.normal(0, 1)),
                "v23": float(np.random.normal(0, 1)),
                "v24": float(np.random.normal(0, 1)),
                "v25": float(np.random.normal(0, 1)),
                "v26": float(np.random.normal(0, 1)),
                "v27": float(np.random.normal(0, 1)),
                "v28": float(np.random.normal(0, 1)),
                "amount": float(np.random.uniform(10, 200)),
            }

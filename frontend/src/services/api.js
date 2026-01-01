import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Prediction endpoints
export const predictFraud = async (transaction) => {
  const response = await api.post('/predict', transaction);
  return response.data;
};

export const predictBatch = async (transactions) => {
  const response = await api.post('/predict/batch', { transactions });
  return response.data;
};

export const getSampleLegitimate = async () => {
  const response = await api.get('/predict/sample/legitimate');
  return response.data;
};

export const getSampleFraud = async () => {
  const response = await api.get('/predict/sample/fraud');
  return response.data;
};

// Analytics endpoints
export const getStats = async () => {
  const response = await api.get('/analytics/stats');
  return response.data;
};

export const getModelInfo = async () => {
  const response = await api.get('/analytics/model');
  return response.data;
};

export const getFeatureImportance = async () => {
  const response = await api.get('/analytics/features');
  return response.data;
};

// Health endpoint
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

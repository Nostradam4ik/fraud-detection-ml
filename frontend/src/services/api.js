import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication ====================

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const { access_token } = response.data;
  localStorage.setItem('token', access_token);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-logout'));
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  const { access_token } = response.data;
  localStorage.setItem('token', access_token);
  return response.data;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// ==================== Prediction endpoints ====================

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

// ==================== Analytics endpoints ====================

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

// ==================== Health endpoint ====================

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;

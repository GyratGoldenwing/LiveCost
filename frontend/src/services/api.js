/**
 * LiveCost API Service
 * Handles communication with FastAPI backend
 *
 * Author: Jeremiah Williams
 * Course: Project & Portfolio IV
 */

import axios from 'axios';

// API base URL - FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Make a cost prediction based on lifestyle inputs
 * @param {Object} data - User input data
 * @returns {Promise<Object>} - Prediction result
 */
export const predictCost = async (data) => {
  try {
    const response = await api.post('/predict', {
      // City selection
      city: data.city,
      // 8 Lifestyle Questions
      apartment_size: data.apartmentSize,
      dining_frequency: parseInt(data.diningFrequency, 10),
      car_type: data.carType,
      commute_miles: parseFloat(data.commuteMiles),
      entertainment_budget: data.entertainmentBudget,
      grocery_habits: data.groceryHabits,
      fitness_routine: data.fitnessRoutine,
      healthcare_needs: data.healthcareNeeds,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.detail || 'Server error occurred');
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to connect to server. Is the backend running?');
    } else {
      // Error setting up request
      throw new Error(error.message);
    }
  }
};

/**
 * Check API health status
 * @returns {Promise<Object>} - Health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API health check failed');
  }
};

/**
 * Get list of available cities
 * @returns {Promise<Object>} - Cities list
 */
export const getCities = async () => {
  try {
    const response = await api.get('/cities');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch cities');
  }
};

/**
 * Get model information
 * @returns {Promise<Object>} - Model info
 */
export const getModelInfo = async () => {
  try {
    const response = await api.get('/model-info');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch model info');
  }
};

/**
 * Get recent queries
 * @returns {Promise<Object>} - Recent queries
 */
export const getRecentQueries = async () => {
  try {
    const response = await api.get('/recent-queries');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch recent queries');
  }
};

export default api;

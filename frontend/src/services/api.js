/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/appointments')
 * @param {object} options - Request options (method, body, headers, etc.)
 * @returns {Promise} - Response data or error
 */
async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    ...otherOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...otherOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

/**
 * GET request
 */
export const get = (endpoint, options = {}) => 
  apiRequest(endpoint, { method: 'GET', ...options });

/**
 * POST request
 */
export const post = (endpoint, body, options = {}) => 
  apiRequest(endpoint, { method: 'POST', body, ...options });

/**
 * PUT request
 */
export const put = (endpoint, body, options = {}) => 
  apiRequest(endpoint, { method: 'PUT', body, ...options });

/**
 * PATCH request
 */
export const patch = (endpoint, body, options = {}) => 
  apiRequest(endpoint, { method: 'PATCH', body, ...options });

/**
 * DELETE request
 */
export const deleteRequest = (endpoint, options = {}) => 
  apiRequest(endpoint, { method: 'DELETE', ...options });

/**
 * Appointments API
 */
export const appointments = {
  getAll: () => get('/appointments'),
  getById: (id) => get(`/appointments/${id}`),
  create: (data) => post('/appointments', data),
  update: (id, data) => put(`/appointments/${id}`, data),
  delete: (id) => deleteRequest(`/appointments/${id}`),
  getAvailable: (params) => get(`/appointments/available?${new URLSearchParams(params)}`),
};

/**
 * Users API
 */
export const users = {
  getAll: () => get('/users'),
  getById: (id) => get(`/users/${id}`),
  create: (data) => post('/users', data),
  update: (id, data) => put(`/users/${id}`, data),
  delete: (id) => deleteRequest(`/users/${id}`),
  login: (credentials) => post('/users/login', credentials),
  logout: () => post('/users/logout', {}),
};

/**
 * Health check
 */
export const health = () => get('/health');

export default {
  get,
  post,
  put,
  patch,
  deleteRequest,
  appointments,
  users,
  health,
};

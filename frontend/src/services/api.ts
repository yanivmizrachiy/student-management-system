import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for better error handling
api.interceptors.request.use(
  (config) => {
    // Only add token if Authorization header is not already set
    if (!config.headers.Authorization) {
      // Load token dynamically for each request
      const token = localStorage.getItem('auth-storage');
      if (token) {
        try {
          const parsed = JSON.parse(token);
          if (parsed.state?.token) {
            config.headers.Authorization = `Bearer ${parsed.state.token}`;
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend server might not be running');
    } else if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server - Backend might not be running');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Token will be loaded dynamically in the request interceptor
// This allows the token to be updated when the user logs in
// Note: Some endpoints (like /grades GET) are public and don't require auth

export default api;


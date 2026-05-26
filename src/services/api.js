import axios from 'axios';

// Get API base URL from Vite env variables, fallback to active backend port 8000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Request Interceptor: Inject JWT token if it exists in localStorage
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[HTTP Request] ${config.method?.toUpperCase()} -> ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[HTTP Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercept globally and handle 401 unauth expiries
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[HTTP Response] ${response.status} <- ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[HTTP Response Error] ${error.response?.status || 'Network'} <- ${error.config?.url}`, error.response?.data);
    const originalRequest = error.config;
    
    // Auto-logout user if token is expired or invalid (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[HTTP Auth] Token expired or invalid (401). Performing auto-logout.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are in a browser, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

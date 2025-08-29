import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('naagrik-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response.data;
  },
  async (error) => {
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    const originalRequest = error.config;
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== 'undefined') {
        try {
          // Try to get refresh token from auth store
          const persistedAuth = localStorage.getItem('naagrik-auth') || sessionStorage.getItem('naagrik-auth');
          if (persistedAuth) {
            const { state } = JSON.parse(persistedAuth);
            if (state?.refreshToken) {
              // Import auth store dynamically to avoid circular dependency
              const { useAuthStore } = await import('../../store/stores/authStore');
              const refreshResult = await useAuthStore.getState().refreshAuthToken();
              
              if (refreshResult.success) {
                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${refreshResult.token}`;
                return api(originalRequest);
              }
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // If refresh fails or no refresh token, clean up and redirect
        localStorage.removeItem('naagrik-token');
        localStorage.removeItem('naagrik-auth');
        sessionStorage.removeItem('naagrik-auth');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Return formatted error
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

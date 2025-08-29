import api from './client';

// Auth API calls (exactly from original api.js)
export const authAPI = {
  register: (userData) => {
    // Validate userData is an object
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data: must be an object');
    }
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    // Validate credentials is an object
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Invalid credentials: must be an object');
    }
    return api.post('/auth/login', credentials);
  },
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return api.post('/auth/refresh', { refreshToken });
  },
  logout: (refreshToken) => api.post('/auth/logout', refreshToken ? { refreshToken } : {}),
};

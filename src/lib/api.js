// Import all API modules
import { authAPI } from './api/authApi';
import { userAPI } from './api/userApi';
import { issueAPI } from './api/issueApi';
import { commentAPI } from './api/commentApi';
import { uploadAPI } from './api/uploadApi';
import { stewardAPI } from './api/stewardApi';
import api from './api/client';

// Re-export all API modules for backward compatibility
export { authAPI };
export { userAPI };
export { issueAPI };
export { commentAPI };
export { uploadAPI };
export { stewardAPI };

// Utility functions (preserved from original)
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('naagrik_token', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('naagrik_token');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('naagrik_token');
    localStorage.removeItem('naagrik_user');
  }
};

// Export the base API client
export default api;

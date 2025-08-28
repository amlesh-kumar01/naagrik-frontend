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
      const token = localStorage.getItem('civicconnect_token');
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
  (error) => {
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('civicconnect_token');
        localStorage.removeItem('civicconnect_user');
        window.location.href = '/login';
      }
    }
    
    // Return formatted error
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API calls
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
  refreshToken: () => api.post('/auth/refresh'),
};

// User API calls
export const userAPI = {
  getLeaderboard: (limit = 50) => api.get(`/users/leaderboard?limit=${limit}`),
  getUserBadges: (userId) => api.get(`/users/${userId}/badges`),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
};

// Issue API calls
export const issueAPI = {
  createIssue: (issueData) => {
    // Map frontend data to backend expected format
    const backendData = {
      title: issueData.title,
      description: issueData.description,
      categoryId: issueData.categoryId || issueData.category_id,
      locationLat: issueData.locationLat || issueData.location_lat,
      locationLng: issueData.locationLng || issueData.location_lng,
      address: issueData.address
    };
    return api.post('/issues', backendData);
  },
  getIssues: (params = {}) => {
    // Map frontend params to backend expected params
    const backendParams = {};
    if (params.page) backendParams.page = params.page;
    if (params.limit) backendParams.limit = params.limit;
    if (params.status && params.status !== 'all') backendParams.status = params.status;
    if (params.category && params.category !== 'all') backendParams.categoryId = params.category;
    if (params.categoryId) backendParams.categoryId = params.categoryId;
    if (params.userId) backendParams.userId = params.userId;
    if (params.search) backendParams.search = params.search;
    
    const queryString = new URLSearchParams(backendParams).toString();
    return api.get(`/issues${queryString ? `?${queryString}` : ''}`);
  },
  getIssueById: (issueId) => api.get(`/issues/${issueId}`),
  updateIssueStatus: (issueId, status, reason) => 
    api.put(`/issues/${issueId}/status`, { status, reason }),
  voteIssue: (issueId, voteType) => api.post(`/issues/${issueId}/vote`, { voteType }),
  getCategories: () => api.get('/issues/categories'),
  deleteIssue: (issueId) => api.delete(`/issues/${issueId}`),
  findSimilarIssues: (text) => api.post('/issues/find-similar', { text }),
};

// Comment API calls
export const commentAPI = {
  createComment: (issueId, content) => api.post(`/comments/issues/${issueId}/comments`, { content }),
  getComments: (issueId) => api.get(`/comments/issues/${issueId}/comments`),
  updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  getUserComments: (userId, page = 1, limit = 20) => 
    api.get(`/users/${userId}/comments?page=${page}&limit=${limit}`),
  flagComment: (commentId, reason) => api.post(`/comments/${commentId}/flag`, { reason }),
};

// Upload API calls
export const uploadAPI = {
  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadIssueMedia: (mediaFiles) => {
    const formData = new FormData();
    Array.from(mediaFiles).forEach(file => {
      formData.append('media', file);
    });
    return api.post('/upload/issue-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMedia: (publicId, type = 'image') => 
    api.delete('/upload/media', { data: { publicId, type } }),
  getMediaInfo: (publicId) => api.get(`/upload/media/${publicId}`),
};

// Steward API calls
export const stewardAPI = {
  submitApplication: (justification) => api.post('/stewards/applications', { justification }),
  getMyApplication: () => api.get('/stewards/applications/me'),
  getMyZones: () => api.get('/stewards/zones/me'),
  getPendingApplications: () => api.get('/stewards/applications/pending'),
  reviewApplication: (applicationId, status, feedback) => 
    api.put(`/stewards/applications/${applicationId}/review`, { status, feedback }),
  getAllStewards: () => api.get('/stewards'),
  addStewardNote: (issueId, note) => api.post(`/stewards/issues/${issueId}/notes`, { note }),
  getStewardNotes: (issueId) => api.get(`/stewards/issues/${issueId}/notes`),
  getMyStewardStats: () => api.get('/stewards/stats/me'),
};

// Utility functions
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civicconnect_token', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('civicconnect_token');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('civicconnect_token');
    localStorage.removeItem('civicconnect_user');
  }
};

export default api;

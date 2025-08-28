import api from './client';

// User API calls (exactly from original api.js)
export const userAPI = {
  getLeaderboard: (limit = 50) => api.get(`/users/leaderboard?limit=${limit}`),
  getUserBadges: (userId) => api.get(`/users/${userId}/badges`),
  getUserProfile: (userId) => api.get(`/users/${userId}`),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
};

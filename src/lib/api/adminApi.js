import api from './client';

export const adminAPI = {
  // User management
  getAllUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },

  // Get filtered users
  getFilteredUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/users/admin/filtered${queryString ? `?${queryString}` : ''}`);
  },

  // Get user statistics
  getUserStatistics: () => api.get('/users/admin/statistics'),

  // Get user activity summary
  getUserActivity: (userId) => api.get(`/users/${userId}/activity`),

  // Get user history
  getUserHistory: (userId, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/users/${userId}/history${queryString ? `?${queryString}` : ''}`);
  },

  // Update user reputation
  updateUserReputation: (userId, data) => api.put(`/users/${userId}/reputation`, data),

  // Update user status (suspend/unsuspend)
  updateUserStatus: (userId, data) => api.put(`/users/${userId}/status`, data),

  // Bulk update user roles
  bulkUpdateUserRoles: (data) => api.put('/users/bulk/role', data),

  // Steward management
  assignStewardToZone: (data) => api.post('/stewards/assignments', data),

  removeStewardFromZone: (data) => api.delete('/stewards/assignments', { data }),

  getAllStewards: () => api.get('/stewards'),

  getStewardStats: (stewardId) => api.get(`/stewards/${stewardId}/stats`),

  // Bulk operations
  bulkUpdateIssueStatus: (data) => api.put('/issues/bulk/status', data),
};

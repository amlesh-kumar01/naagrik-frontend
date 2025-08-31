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
  // Steward management with new category-zone system
  getAllStewards: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/stewards${queryString ? `?${queryString}` : ''}`);
  },

  assignStewardToCategory: (data) => api.post('/stewards/assignments/category', {
    stewardId: data.stewardId,
    categoryId: data.categoryId,
    zoneId: data.zoneId,
    notes: data.notes
  }),

  bulkAssignSteward: (data) => api.post('/stewards/assignments/bulk', {
    stewardId: data.stewardId,
    assignments: data.assignments
  }),

  removeStewardAssignment: (stewardId, categoryId, zoneId) => 
    api.delete(`/stewards/assignments/${stewardId}/${categoryId}/${zoneId}`),

  getStewardAssignments: (stewardId) => api.get(`/stewards/${stewardId}/assignments`),
  getAllStewardAssignments: () => api.get('/stewards/assignments'),

  // Legacy zone assignment (kept for backward compatibility)
  assignStewardToZone: (data) => api.post('/stewards/assignments/legacy-zone', data),
  removeStewardFromZone: (data) => api.delete('/stewards/assignments/legacy-zone', { data }),

  getStewardStats: (stewardId) => api.get(`/stewards/${stewardId}/stats`),

  // Bulk operations
  bulkUpdateIssueStatus: (data) => api.put('/issues/bulk/status', data),
};

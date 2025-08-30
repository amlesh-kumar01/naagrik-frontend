import api from './client';

export const badgeAPI = {
  // Get all badges (public)
  getAllBadges: () => api.get('/badges'),

  // Get badge details (public)
  getBadgeDetails: (badgeId) => api.get(`/badges/${badgeId}`),

  // Create badge (admin only)
  createBadge: (data) => api.post('/badges', data),

  // Update badge (admin only)
  updateBadge: (badgeId, data) => api.put(`/badges/${badgeId}`, data),

  // Delete badge (admin only)
  deleteBadge: (badgeId) => api.delete(`/badges/${badgeId}`),

  // Award badge to user (admin only)
  awardBadge: (data) => api.post('/badges/award', data),

  // Remove badge from user (admin only)
  removeBadge: (data) => api.post('/badges/remove', data),

  // Get badge holders
  getBadgeHolders: (badgeId, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/badges/${badgeId}/holders${queryString ? `?${queryString}` : ''}`);
  },

  // Get badge statistics
  getBadgeStats: (badgeId) => api.get(`/badges/${badgeId}/stats`),
};

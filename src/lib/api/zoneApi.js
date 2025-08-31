import api from './client';

export const zoneAPI = {
  // Public zone endpoints (no auth required)
  getAvailableZones: () => api.get('/zones/public/available'),
  searchZones: (query) => api.get(`/zones/public/search?q=${encodeURIComponent(query)}`),
  getCategories: () => api.get('/zones/categories'),

  // Admin zone management (requires admin token)
  getAllZones: () => api.get('/zones'),
  getZoneDetails: (zoneId) => api.get(`/zones/${zoneId}`),
  createZone: (data) => api.post('/zones', data),
  updateZone: (zoneId, data) => api.put(`/zones/${zoneId}`, data),
  deleteZone: (zoneId) => api.delete(`/zones/${zoneId}`),
  getZoneStats: (zoneId) => api.get(`/zones/${zoneId}/stats`),

  // Zone-specific queries
  getZoneIssues: (zoneId, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/zones/${zoneId}/issues${queryString ? `?${queryString}` : ''}`);
  },

  getZoneStewards: (zoneId) => api.get(`/zones/${zoneId}/stewards`),

  // Zone filtering for issues
  getIssuesByZone: (zoneId, params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/issues?zone=${zoneId}${queryString ? `&${queryString}` : ''}`);
  }
};

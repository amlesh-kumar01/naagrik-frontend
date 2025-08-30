import api from './client';

export const zoneAPI = {
  // Get all zones
  getAllZones: () => api.get('/zones'),

  // Get zone details
  getZoneDetails: (zoneId) => api.get(`/zones/${zoneId}`),

  // Create zone (admin only)
  createZone: (data) => api.post('/zones', data),

  // Update zone (admin only)
  updateZone: (zoneId, data) => api.put(`/zones/${zoneId}`, data),

  // Delete zone (admin only)
  deleteZone: (zoneId) => api.delete(`/zones/${zoneId}`),

  // Get zone statistics
  getZoneStats: (zoneId) => api.get(`/zones/${zoneId}/stats`),

  // Get zone issues
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

  // Get zone stewards
  getZoneStewards: (zoneId) => api.get(`/zones/${zoneId}/stewards`),
};

import api from './client';

// Steward API calls (exactly from original api.js)
export const stewardAPI = {
  // Existing APIs
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

  // New Steward Management APIs
  assignStewardToZone: (stewardId, zoneId) => 
    api.post('/stewards/assignments', { stewardId, zoneId }),
  removeStewardFromZone: (stewardId, zoneId) => 
    api.delete('/stewards/assignments', { data: { stewardId, zoneId } }),
  getStewardStats: (stewardId) => api.get(`/stewards/${stewardId}/stats`),
};

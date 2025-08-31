import api from './client';

// Steward API calls updated for new category-zone assignment system
export const stewardAPI = {
  // Steward application process
  submitApplication: (applicationData) => api.post('/stewards/applications', {
    motivation: applicationData.motivation,
    experience: applicationData.experience,
    categories: applicationData.categories, // Array of category UUIDs
    zones: applicationData.zones // Array of zone UUIDs
  }),
  getMyApplication: () => api.get('/stewards/applications/me'),
  getApplicationStatus: () => api.get('/stewards/applications/me'),

  // Steward category and zone management
  getMyStewardCategories: () => api.get('/stewards/categories/me'),
  getMyAssignedIssues: () => api.get('/stewards/issues/me'),
  getStewardWorkload: () => api.get('/stewards/workload'),
  getMyStewardStats: () => api.get('/stewards/stats/me'),

  // Admin: Application management
  getPendingApplications: () => api.get('/stewards/applications/pending'),
  getAllApplications: () => api.get('/stewards/applications'),
  reviewApplication: (applicationId, reviewData) => 
    api.put(`/stewards/applications/${applicationId}/review`, {
      status: reviewData.status, // 'APPROVED' | 'REJECTED'
      reviewNotes: reviewData.reviewNotes
    }),

  // Admin: Steward category assignments
  assignStewardToCategory: (assignmentData) => api.post('/stewards/assignments/category', {
    stewardId: assignmentData.stewardId,
    categoryId: assignmentData.categoryId,
    zoneId: assignmentData.zoneId,
    notes: assignmentData.notes
  }),
  
  bulkAssignSteward: (assignmentData) => api.post('/stewards/assignments/bulk', {
    stewardId: assignmentData.stewardId,
    assignments: assignmentData.assignments // Array of { categoryId, zoneId }
  }),

  removeStewardAssignment: (stewardId, categoryId, zoneId) => 
    api.delete(`/stewards/assignments/${stewardId}/${categoryId}/${zoneId}`),

  getStewardAssignments: (stewardId) => api.get(`/stewards/${stewardId}/assignments`),
  getAllStewardAssignments: () => api.get('/stewards/assignments'),

  // Legacy zone assignment methods (kept for backward compatibility)
  getMyZones: () => api.get('/stewards/categories/me'), // Maps to new categories endpoint
  assignStewardToZone: (stewardId, zoneId) => 
    api.post('/stewards/assignments/legacy-zone', { stewardId, zoneId }),
  removeStewardFromZone: (stewardId, zoneId) => 
    api.delete('/stewards/assignments/legacy-zone', { data: { stewardId, zoneId } }),

  // Admin: Get all stewards with filtering
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

  // Steward issue management
  addStewardNote: (issueId, noteData) => api.post(`/stewards/issues/${issueId}/notes`, {
    note: noteData.note,
    isInternal: noteData.isInternal || false,
    priority: noteData.priority || 'medium'
  }),
  getStewardNotes: (issueId) => api.get(`/stewards/issues/${issueId}/notes`),
  updateStewardNote: (noteId, noteData) => api.put(`/stewards/notes/${noteId}`, noteData),
  deleteStewardNote: (noteId) => api.delete(`/stewards/notes/${noteId}`),

  // Individual steward stats (admin)
  getStewardStats: (stewardId) => api.get(`/stewards/${stewardId}/stats`),
  getStewardPerformance: (stewardId) => api.get(`/stewards/${stewardId}/performance`),
};

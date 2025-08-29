import api from './client';

// Issue API calls (exactly from original api.js)
export const issueAPI = {
  createIssue: (issueData) => {
    // Check if issueData is FormData (contains media files)
    if (issueData instanceof FormData) {
      console.log('Sending FormData with entries:');
      for (let [key, value] of issueData.entries()) {
        console.log(`${key}:`, value);
      }
      // Let axios handle the Content-Type header automatically for FormData
      return api.post('/issues', issueData);
    } else {
      // Map frontend data to backend expected format for regular object data
      const backendData = {
        title: issueData.title,
        description: issueData.description,
        categoryId: issueData.categoryId || issueData.category_id,
        locationLat: issueData.locationLat || issueData.location_lat,
        locationLng: issueData.locationLng || issueData.location_lng,
        address: issueData.address
      };
      return api.post('/issues', backendData);
    }
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

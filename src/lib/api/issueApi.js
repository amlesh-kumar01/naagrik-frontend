import api from './client';

// Issue API calls with all advanced features
export const issueAPI = {
  // Basic issue operations
  createIssue: (issueData) => {
    if (issueData instanceof FormData) {
      return api.post('/issues', issueData, {
        headers: {
          'Content-Type': undefined, 
        },
      });
    } else {
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
  removeVoteFromIssue: (issueId) => api.delete(`/issues/${issueId}/vote`),
  getCategories: () => api.get('/issues/categories'),
  deleteIssue: (issueId) => api.delete(`/issues/${issueId}`),
  
  // Archive issue (soft delete for resolved issues)
  archiveIssue: (issueId, data) => api.put(`/issues/${issueId}/archive`, data),
  
  // Mark issue as duplicate
  markAsDuplicate: (issueId, data) => api.put(`/issues/${issueId}/duplicate`, data),
  
  // Get issue history
  getIssueHistory: (issueId) => api.get(`/issues/${issueId}/history`),
  
  // Restore archived issue (admin only)
  restoreIssue: (issueId, data) => api.put(`/issues/${issueId}/restore`, data),
  
  findSimilarIssues: (text) => api.post('/issues/find-similar', { text }),

  // Advanced filtering and search
  getAdvancedFiltered: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value);
        }
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/issues/filter/advanced${queryString ? `?${queryString}` : ''}`);
  },

  // Trending issues
  getTrendingIssues: (limit = 20) => api.get(`/issues/analytics/trending?limit=${limit}`),

  // Issue statistics
  getIssueStatistics: () => api.get('/issues/analytics/statistics'),

  // Categories with statistics
  getCategoriesWithStats: () => api.get('/issues/analytics/categories'),

  // Issues by location
  getIssuesByLocation: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/issues/filter/location${queryString ? `?${queryString}` : ''}`);
  },

  // My issues
  getMyIssues: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/issues/my/issues${queryString ? `?${queryString}` : ''}`);
  },

  // Issues requiring steward attention
  getIssuesRequiringAttention: () => api.get('/issues/steward/attention'),

  // Bulk operations
  bulkUpdateStatus: (data) => api.put('/issues/bulk/status', data),

  // Comments - Updated for nested structure
  getComments: (issueId, params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Set default nested to true and sortBy to oldest for consistency
    searchParams.append('nested', params.nested !== undefined ? params.nested : 'true');
    searchParams.append('sortBy', params.sortBy || 'oldest');
    
    return api.get(`/comments/issues/${issueId}/comments?${searchParams.toString()}`);
  },

  createComment: (issueId, data) => {
    const payload = {
      content: data.content
    };
    
    // Add parentCommentId for replies
    if (data.parentCommentId) {
      payload.parentCommentId = data.parentCommentId;
    }
    
    return api.post(`/comments/issues/${issueId}/comments`, payload);
  },

  updateComment: (commentId, data) => api.put(`/comments/${commentId}`, { 
    content: data.content 
  }),

  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  // Steward notes
  addStewardNote: (issueId, data) => api.post(`/stewards/issues/${issueId}/notes`, data),
  getStewardNotes: (issueId) => api.get(`/stewards/issues/${issueId}/notes`),
};

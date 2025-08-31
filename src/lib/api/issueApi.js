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
        zoneId: issueData.zoneId || issueData.zone_id, // Required zone selection
        priority: issueData.priority || 'MEDIUM',
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
    if (params.category && params.category !== 'all') backendParams.category = params.category;
    if (params.categoryId) backendParams.category = params.categoryId;
    if (params.zone && params.zone !== 'all') backendParams.zone = params.zone;
    if (params.zoneId) backendParams.zone = params.zoneId;
    if (params.userId) backendParams.userId = params.userId;
    if (params.search) backendParams.search = params.search;
    
    // Support for array filters
    if (params.categories && Array.isArray(params.categories)) {
      backendParams['categories[]'] = params.categories;
    }
    if (params.zones && Array.isArray(params.zones)) {
      backendParams['zones[]'] = params.zones;
    }
    if (params.statuses && Array.isArray(params.statuses)) {
      backendParams['statuses[]'] = params.statuses;
    }
    
    // Support for advanced filters
    if (params.priority) backendParams.priority = params.priority;
    if (params.createdAfter) backendParams.createdAfter = params.createdAfter;
    if (params.createdBefore) backendParams.createdBefore = params.createdBefore;
    if (params.minVotes) backendParams.minVotes = params.minVotes;
    if (params.hasMedia) backendParams.hasMedia = params.hasMedia;
    if (params.sortBy) backendParams.sortBy = params.sortBy;
    if (params.sortOrder) backendParams.sortOrder = params.sortOrder;
    
    const queryString = new URLSearchParams();
    Object.entries(backendParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, v));
      } else {
        queryString.append(key, value);
      }
    });
    
    return api.get(`/issues${queryString.toString() ? `?${queryString.toString()}` : ''}`);
  },

  getIssueById: (issueId) => api.get(`/issues/${issueId}`),
  updateIssueStatus: (issueId, status, reason) => 
    api.put(`/issues/${issueId}/status`, { status, reason }),
  voteIssue: (issueId, voteType) => api.post(`/issues/${issueId}/vote`, { voteType }),
  removeVoteFromIssue: (issueId) => api.delete(`/issues/${issueId}/vote`),
  deleteVote: (issueId) => api.delete(`/issues/${issueId}/vote`), // Dedicated delete vote function
  getUserVoteStatus: (issueId) => api.get(`/issues/${issueId}/vote-status`),
  getCategories: () => api.get('/issues/categories'),
  
  // Hard delete issue (permanent deletion)
  hardDeleteIssue: (issueId) => api.delete(`/issues/${issueId}/hard-delete`),
  
  // Soft delete (legacy - for backward compatibility)
  deleteIssue: (issueId) => api.delete(`/issues/${issueId}`),
  
  // Archive issue (soft delete for resolved issues)
  archiveIssue: (issueId, data) => api.put(`/issues/${issueId}/archive`, data),
  
  // Mark issue as duplicate
  markAsDuplicate: (issueId, data) => api.put(`/issues/${issueId}/duplicate`, data),
  
  // Get issue history
  getIssueHistory: (issueId) => api.get(`/issues/${issueId}/history`),
  
  // Restore archived issue (admin only)
  restoreIssue: (issueId, data) => api.put(`/issues/${issueId}/restore`, data),
  
  findSimilarIssues: (data) => api.post('/issues/find-similar', {
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    zoneId: data.zoneId
  }),

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

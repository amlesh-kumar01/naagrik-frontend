import api from './client';

// Comment API calls - Updated to match new nested structure
export const commentAPI = {
  // Create comment or reply
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

  // Get nested comments for an issue
  getComments: (issueId, params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Set default nested to true for new structure
    searchParams.append('nested', params.nested !== undefined ? params.nested : 'true');
    
    // Add sorting (default to oldest for thread consistency)
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy);
    }
    
    return api.get(`/comments/issues/${issueId}/comments?${searchParams.toString()}`);
  },

  // Update comment content
  updateComment: (commentId, data) => api.put(`/comments/${commentId}`, { 
    content: data.content 
  }),

  // Delete comment (cascades to delete all replies)
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

  // Flag comment with reason and details
  flagComment: (commentId, data) => {
    const payload = {};
    
    if (data.reason) {
      payload.reason = data.reason;
    }
    
    if (data.details) {
      payload.details = data.details;
    }
    
    return api.post(`/comments/${commentId}/flag`, payload);
  },

  // Get user's comments (keeping for profile features)
  getUserComments: (userId, page = 1, limit = 20) => 
    api.get(`/comments/users/${userId}/comments?page=${page}&limit=${limit}`),

  // Admin/Steward endpoints for moderation
  getFlaggedComments: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.offset) searchParams.append('offset', params.offset);
    
    return api.get(`/comments/flagged?${searchParams.toString()}`);
  },

  // Review flagged comment
  reviewFlaggedComment: (commentId, data) => api.put(`/comments/${commentId}/review`, {
    action: data.action, // 'APPROVE' or 'DELETE'
    feedback: data.feedback
  }),

  // Steward: Delete comments in assigned zones
  stewardDeleteComment: (commentId, reason) => api.delete(`/comments/${commentId}/steward`, {
    data: { reason }
  }),

  // Steward: Get comments in assigned zones for moderation
  getStewardModerationComments: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    return api.get(`/comments/steward/moderation${queryString ? `?${queryString}` : ''}`);
  },

  // Steward: Bulk moderate comments
  bulkModerateComments: (commentIds, action, reason) => api.post('/comments/steward/bulk-moderate', {
    commentIds,
    action, // 'DELETE' or 'APPROVE' or 'FLAG'
    reason
  }),
};

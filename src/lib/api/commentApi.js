import api from './client';

// Comment API calls (exactly from original api.js)
export const commentAPI = {
  createComment: (issueId, content) => api.post(`/comments/issues/${issueId}/comments`, { content }),
  getComments: (issueId) => api.get(`/comments/issues/${issueId}/comments`),
  updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  getUserComments: (userId, page = 1, limit = 20) => 
    api.get(`/users/${userId}/comments?page=${page}&limit=${limit}`),
  flagComment: (commentId, reason) => api.post(`/comments/${commentId}/flag`, { reason }),
};

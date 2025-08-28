import { create } from 'zustand';
import { issueAPI, uploadAPI, commentAPI } from '../../lib/api';

// Issues Store (exactly from original index.js)
export const useIssuesStore = create((set, get) => ({
  issues: [],
  categories: [],
  currentIssue: null,
  comments: [],
  isLoading: false,
  error: null,
  pagination: null,

  // Actions
  setIssues: (issues) => set({ issues }),
  setCategories: (categories) => set({ categories }),
  setCurrentIssue: (issue) => set({ currentIssue: issue }),
  setComments: (comments) => set({ comments }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),

  // Add new issue to the list
  addIssue: (issue) => set(state => ({ 
    issues: [issue, ...state.issues] 
  })),

  // Update issue in the list
  updateIssue: (issueId, updates) => set(state => ({
    issues: state.issues.map(issue => 
      issue.id === issueId ? { ...issue, ...updates } : issue
    ),
    currentIssue: state.currentIssue?.id === issueId 
      ? { ...state.currentIssue, ...updates } 
      : state.currentIssue
  })),

  // Remove issue from the list
  removeIssue: (issueId) => set(state => ({
    issues: state.issues.filter(issue => issue.id !== issueId),
    currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue
  })),

  // Add comment to current issue
  addComment: (comment) => set(state => ({ 
    comments: [...state.comments, comment] 
  })),

  // Update comment
  updateComment: (commentId, updates) => set(state => ({
    comments: state.comments.map(comment => 
      comment.id === commentId ? { ...comment, ...updates } : comment
    )
  })),

  // Remove comment
  removeComment: (commentId) => set(state => ({
    comments: state.comments.filter(comment => comment.id !== commentId)
  })),

  // Create new issue with media upload support
  createIssue: async (issueData) => {
    set({ isLoading: true, error: null });
    
    try {
      let mediaUrls = [];
      
      // Handle media upload first if there are files
      if (issueData instanceof FormData) {
        const mediaFiles = issueData.getAll('media');
        if (mediaFiles && mediaFiles.length > 0) {
          try {
            const uploadResponse = await uploadAPI.uploadIssueMedia(mediaFiles);
            mediaUrls = uploadResponse.data.map(item => item.url);
          } catch (uploadError) {
            throw new Error(`Media upload failed: ${uploadError.message}`);
          }
        }
        
        // Convert FormData to regular object
        const issuePayload = {};
        for (const [key, value] of issueData.entries()) {
          if (key !== 'media') {
            issuePayload[key] = value;
          }
        }
        
        // Add media URLs to payload
        if (mediaUrls.length > 0) {
          issuePayload.thumbnailUrl = mediaUrls[0]; // First image as thumbnail
          issuePayload.mediaUrls = mediaUrls;
        }
        
        // Create issue
        const response = await issueAPI.createIssue(issuePayload);
        // Backend returns { success: true, message: "...", issue: {...} }
        const newIssue = response.issue || response.data?.issue;
        
        // Add to store
        set(state => ({ 
          issues: [newIssue, ...state.issues],
          isLoading: false,
          error: null
        }));
        
        return newIssue;
      } else {
        // Handle regular object data
        const response = await issueAPI.createIssue(issueData);
        // Backend returns { success: true, message: "...", issue: {...} }
        const newIssue = response.issue || response.data?.issue;
        
        set(state => ({ 
          issues: [newIssue, ...state.issues],
          isLoading: false,
          error: null
        }));
        
        return newIssue;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to create issue'
      });
      throw error;
    }
  },

  // Fetch issues with filters
  fetchIssues: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.getIssues(params);
      
      // Backend returns { success: true, data: { issues: [...], pagination: {...} } }
      // Axios interceptor already extracts response.data
      set({ 
        issues: response.data || [],
        pagination: response.data?.pagination || response.pagination || {},
        isLoading: false,
        error: null
      }); 
      
      return response.data || response;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch issues'
      });
      throw error;
    }
  },

  // Fetch single issue
  fetchIssue: async (issueId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.getIssueById(issueId);
      
      // Backend returns { success: true, issue: {...} }
      // Axios interceptor already extracts response.data
      const issue = response.issue || response.data?.issue || response;
      
      // Set comments from the issue data if available
      const comments = issue.comments || [];
      
      set({ 
        currentIssue: issue,
        comments: comments,
        isLoading: false,
        error: null
      });
      
      return issue;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch issue'
      });
      throw error;
    }
  },

  // Vote on issue
  voteOnIssue: async (issueId, voteType = 1) => {
    try {
      const response = await issueAPI.voteIssue(issueId, voteType);
      
      // Update the issue in the current issues list
      const { issues } = get();
      const updatedIssues = issues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            vote_score: response.voteScore || issue.vote_score,
            user_vote: response.userVote
          };
        }
        return issue;
      });
      
      set({ issues: updatedIssues });
      return response;
    } catch (error) {
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Create comment
  createComment: async (issueId, content) => {
    try {
      const response = await commentAPI.createComment(issueId, content);
      const newComment = response.comment || response.data?.comment || response;
      
      // Add comment to current comments list
      set(state => ({
        comments: [...state.comments, newComment]
      }));
      
      return newComment;
    } catch (error) {
      throw error;
    }
  },

  // Fetch comments for an issue
  fetchComments: async (issueId) => {
    try {
      const response = await commentAPI.getComments(issueId);
      const comments = response.comments || response.data?.comments || response;
      
      set({ comments: comments });
      return comments;
    } catch (error) {
      throw error;
    }
  },
}));

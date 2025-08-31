import { create } from 'zustand';
import { issueAPI } from '../../lib/api';

// Issues Store (exactly from original index.js)
export const useIssuesStore = create((set, get) => ({
  issues: [],
  categories: [],
  currentIssue: null,
  isLoading: false,
  error: null,
  pagination: null,

  // Actions
  setIssues: (issues) => set({ issues }),
  setCategories: (categories) => set({ categories }),
  setCurrentIssue: (issue) => set({ currentIssue: issue }),
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

  // Create new issue with media upload support
  createIssue: async (issueData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Handle FormData case - send directly to API
      if (issueData instanceof FormData) {
        // Send original FormData directly (contains both issue data and media files)
        const response = await issueAPI.createIssue(issueData);
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
      
      set({ 
        currentIssue: issue,
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
      const { issues, currentIssue } = get();
      const updatedIssues = issues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            vote_score: response.voteScore || issue.vote_score,
            upvote_count: response.data?.issueStats?.upvotes || issue.upvote_count,
            downvote_count: response.data?.issueStats?.downvotes || issue.downvote_count,
            user_vote: response.userVote,
            user_vote_status: {
              hasVoted: true,
              voteType: voteType,
              voteTypeText: voteType === 1 ? 'upvote' : 'downvote'
            }
          };
        }
        return issue;
      });
      
      // Update current issue if it's the one being voted on
      const updatedCurrentIssue = currentIssue?.id === issueId ? {
        ...currentIssue,
        vote_score: response.voteScore || currentIssue.vote_score,
        upvote_count: response.data?.issueStats?.upvotes || currentIssue.upvote_count,
        downvote_count: response.data?.issueStats?.downvotes || currentIssue.downvote_count,
        user_vote: response.userVote,
        user_vote_status: {
          hasVoted: true,
          voteType: voteType,
          voteTypeText: voteType === 1 ? 'upvote' : 'downvote'
        }
      } : currentIssue;
      
      set({ issues: updatedIssues, currentIssue: updatedCurrentIssue });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove vote from issue (using dedicated delete API)
  deleteVote: async (issueId) => {
    try {
      const response = await issueAPI.deleteVote(issueId);
      
      // Update the issue in the current issues list
      const { issues, currentIssue } = get();
      const updatedIssues = issues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            vote_score: response.data?.voteScore || response.voteScore || issue.vote_score,
            upvote_count: response.data?.upvotes || issue.upvote_count,
            downvote_count: response.data?.downvotes || issue.downvote_count,
            user_vote: null,
            user_vote_status: {
              hasVoted: false,
              voteType: null,
              voteTypeText: null
            }
          };
        }
        return issue;
      });
      
      // Update currentIssue if it's the same issue
      const updatedCurrentIssue = currentIssue?.id === issueId ? {
        ...currentIssue,
        vote_score: response.data?.voteScore || response.voteScore || currentIssue.vote_score,
        upvote_count: response.data?.upvotes || currentIssue.upvote_count,
        downvote_count: response.data?.downvotes || currentIssue.downvote_count,
        user_vote: null,
        user_vote_status: {
          hasVoted: false,
          voteType: null,
          voteTypeText: null
        }
      } : currentIssue;
      
      set({ issues: updatedIssues, currentIssue: updatedCurrentIssue });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove vote from issue (legacy - keeping for backward compatibility)
  removeVoteFromIssue: async (issueId) => {
    try {
      const response = await issueAPI.removeVoteFromIssue(issueId);
      
      // Update the issue in the current issues list
      const { issues, currentIssue } = get();
      const updatedIssues = issues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            vote_score: response.data.vote_score || issue.vote_score,
            upvotes: response.data.upvotes || issue.upvotes,
            downvotes: response.data.downvotes || issue.downvotes,
            user_vote: null,
            user_vote_status: {
              hasVoted: false,
              voteType: null,
              voteTypeText: null
            }
          };
        }
        return issue;
      });
      
      // Update currentIssue if it's the same issue
      const updatedCurrentIssue = currentIssue?.id === issueId ? {
        ...currentIssue,
        vote_score: response.data.vote_score || currentIssue.vote_score,
        upvotes: response.data.upvotes || currentIssue.upvotes,
        downvotes: response.data.downvotes || currentIssue.downvotes,
        user_vote: null,
        user_vote_status: {
          hasVoted: false,
          voteType: null,
          voteTypeText: null
        }
      } : currentIssue;
      
      set({ issues: updatedIssues, currentIssue: updatedCurrentIssue });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Archive issue (soft delete for resolved issues)
  archiveIssue: async (issueId, archiveData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await issueAPI.archiveIssue(issueId, archiveData);
      
      // Remove issue from the list
      set(state => ({
        issues: state.issues.filter(issue => issue.id !== issueId),
        currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue,
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error?.message || 'Failed to archive issue'
      });
      throw error;
    }
  },

  // Hard delete issue (permanent deletion - SUPER_ADMIN only)
  deleteIssue: async (issueId, deleteData = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await issueAPI.hardDeleteIssue(issueId);
      
      // Remove issue from the list
      set(state => ({
        issues: state.issues.filter(issue => issue.id !== issueId),
        currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue,
        isLoading: false
      }));
      
      // Return deletion details for confirmation
      return {
        success: true,
        deletedData: response.data?.deletedData || {},
        message: response.data?.message || 'Issue permanently deleted'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          'Failed to delete issue';
      set({ 
        isLoading: false, 
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  },

  // Mark issue as duplicate
  markAsDuplicate: async (issueId, duplicateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await issueAPI.markAsDuplicate(issueId, duplicateData);
      
      // Update issue status in the list
      set(state => ({
        issues: state.issues.map(issue => 
          issue.id === issueId 
            ? { ...issue, status: 'DUPLICATE', primary_issue_id: duplicateData.primaryIssueId }
            : issue
        ),
        currentIssue: state.currentIssue?.id === issueId 
          ? { ...state.currentIssue, status: 'DUPLICATE', primary_issue_id: duplicateData.primaryIssueId }
          : state.currentIssue,
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error?.message || 'Failed to mark as duplicate'
      });
      throw error;
    }
  },

  // Update issue status
  updateIssueStatus: async (issueId, status, reason, notes) => {
    set({ isLoading: true, error: null });
    try {
      const response = await issueAPI.updateIssueStatus(issueId, status, reason);
      
      // Update issue in the list
      set(state => ({
        issues: state.issues.map(issue => 
          issue.id === issueId 
            ? { ...issue, status, updated_at: new Date().toISOString() }
            : issue
        ),
        currentIssue: state.currentIssue?.id === issueId 
          ? { ...state.currentIssue, status, updated_at: new Date().toISOString() }
          : state.currentIssue,
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.error?.message || 'Failed to update issue status'
      });
      throw error;
    }
  },

  // Get issue history
  fetchIssueHistory: async (issueId) => {
    try {
      const response = await issueAPI.getIssueHistory(issueId);
      return response.data.history;
    } catch (error) {
      throw error;
    }
  },
}));

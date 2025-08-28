import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setAuthToken, removeAuthToken, issueAPI, uploadAPI, commentAPI } from '../lib/api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          // Backend returns { success: true, token: "...", user: {...} }
          const { user, token } = response;
          
          setAuthToken(token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          return { success: true, data: { user, token } };
        } catch (error) {
          const errorMessage = error.message || 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false 
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          // Backend returns { success: true, token: "...", user: {...} }
          const { user, token } = response;
          
          setAuthToken(token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          return { success: true, data: { user, token } };
        } catch (error) {
          const errorMessage = error.message || 'Registration failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false 
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        removeAuthToken();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      updateUser: (userData) => {
        set(state => ({ 
          user: { ...state.user, ...userData } 
        }));
      },

      clearError: () => set({ error: null }),

      // Initialize auth state from token
      initializeAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('civicconnect_token') : null;
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          // Backend returns { success: true, user: {...} }
          const user = response.user || response.data?.user;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          removeAuthToken();
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'civicconnect-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// UI Store for general UI state
export const useUIStore = create((set) => ({
  // Map state
  mapCenter: [28.6139, 77.2090],
  mapZoom: 13,
  selectedIssue: null,
  mapViewport: null,

  // Loading states
  isLoadingIssues: false,
  isLoadingComments: false,

  // Modal states
  isReportModalOpen: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,

  // Filters
  issueFilters: {
    status: '',
    categoryId: '',
    search: '',
  },

  // Actions
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  setMapViewport: (viewport) => set({ mapViewport: viewport }),

  setLoadingIssues: (loading) => set({ isLoadingIssues: loading }),
  setLoadingComments: (loading) => set({ isLoadingComments: loading }),

  openReportModal: () => set({ isReportModalOpen: true }),
  closeReportModal: () => set({ isReportModalOpen: false }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  setIssueFilters: (filters) => set(state => ({ 
    issueFilters: { ...state.issueFilters, ...filters } 
  })),
  clearIssueFilters: () => set({ 
    issueFilters: { status: '', categoryId: '', search: '' } 
  }),
}));

// Issues Store
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

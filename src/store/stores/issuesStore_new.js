import { create } from 'zustand';
import { issueAPI } from '../../lib/api/issueApi';

// Issues Store - Updated for zone-category filtering system
export const useIssuesStore = create((set, get) => ({
  issues: [],
  categories: [],
  zones: [], // Available zones for filtering
  currentIssue: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: {
    category: null,
    zone: null,
    status: null,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },

  // Actions
  setIssues: (issues) => set({ issues }),
  setCategories: (categories) => set({ categories }),
  setZones: (zones) => set({ zones }),
  setCurrentIssue: (issue) => set({ currentIssue: issue }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({
    filters: {
      category: null,
      zone: null,
      status: null,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }),

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

  // Create new issue with zone selection validation
  createIssue: async (issueData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate required fields
      if (!issueData.zoneId && !(issueData instanceof FormData && issueData.get('zoneId'))) {
        throw new Error('Zone selection is required');
      }
      
      if (!issueData.categoryId && !(issueData instanceof FormData && issueData.get('categoryId'))) {
        throw new Error('Category selection is required');
      }
      
      // Handle FormData case - send directly to API
      if (issueData instanceof FormData) {
        const response = await issueAPI.createIssue(issueData);
        const newIssue = response.data?.issue || response.issue;
        
        // Add to store
        set(state => ({ 
          issues: [newIssue, ...state.issues],
          isLoading: false,
          error: null
        }));
        
        return newIssue;
      } else {
        // Handle regular object data with zone validation
        const issuePayload = {
          title: issueData.title,
          description: issueData.description,
          categoryId: issueData.categoryId,
          zoneId: issueData.zoneId, // Required field
          priority: issueData.priority || 'MEDIUM',
          locationLat: issueData.locationLat,
          locationLng: issueData.locationLng,
          address: issueData.address
        };
        
        const response = await issueAPI.createIssue(issuePayload);
        const newIssue = response.data?.issue || response.issue;
        
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

  // Fetch issues with zone-category filtering support
  fetchIssues: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      // Merge current filters with params
      const { filters } = get();
      const queryParams = {
        ...filters,
        ...params
      };
      
      // Clean up null/undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const response = await issueAPI.getIssues(queryParams);
      
      // Handle different response formats
      const issuesData = response.data?.issues || response.issues || response.data || [];
      const paginationData = response.data?.pagination || response.pagination || {};
      
      set({ 
        issues: issuesData,
        pagination: paginationData,
        isLoading: false,
        error: null
      }); 
      
      return { issues: issuesData, pagination: paginationData };
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch issues'
      });
      throw error;
    }
  },

  // Fetch issues by zone
  fetchIssuesByZone: async (zoneId, params = {}) => {
    return await get().fetchIssues({ ...params, zone: zoneId });
  },

  // Fetch issues by category
  fetchIssuesByCategory: async (categoryId, params = {}) => {
    return await get().fetchIssues({ ...params, category: categoryId });
  },

  // Advanced filtering with multiple zones/categories
  fetchIssuesAdvanced: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.getAdvancedFiltered(params);
      const issuesData = response.data?.issues || response.issues || [];
      const paginationData = response.data?.pagination || response.pagination || {};
      
      set({ 
        issues: issuesData,
        pagination: paginationData,
        isLoading: false,
        error: null
      }); 
      
      return { issues: issuesData, pagination: paginationData };
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
      const issue = response.data?.issue || response.issue || response;
      
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

  // Fetch categories
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.getCategories();
      const categories = response.data?.categories || response.categories || [];
      
      set({ 
        categories,
        isLoading: false,
        error: null
      });
      
      return categories;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to fetch categories'
      });
      throw error;
    }
  },

  // Find similar issues (for duplicate detection)
  findSimilarIssues: async (issueData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.findSimilarIssues({
        title: issueData.title,
        description: issueData.description,
        categoryId: issueData.categoryId,
        zoneId: issueData.zoneId
      });
      
      const similarIssues = response.data?.similarIssues || response.similarIssues || [];
      
      set({ isLoading: false, error: null });
      return similarIssues;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to find similar issues'
      });
      throw error;
    }
  },

  // Vote on issue
  voteOnIssue: async (issueId, voteType = 1) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.voteIssue(issueId, voteType);
      
      // Update issue in list and current issue
      const voteData = response.data || response;
      
      set(state => ({
        issues: state.issues.map(issue => 
          issue.id === issueId 
            ? { ...issue, votes: voteData.newVoteCount, userVote: voteType }
            : issue
        ),
        currentIssue: state.currentIssue?.id === issueId 
          ? { ...state.currentIssue, votes: voteData.newVoteCount, userVote: voteType }
          : state.currentIssue,
        isLoading: false,
        error: null
      }));
      
      return voteData;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to vote on issue'
      });
      throw error;
    }
  },

  // Remove vote from issue
  removeVoteFromIssue: async (issueId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.removeVoteFromIssue(issueId);
      const voteData = response.data || response;
      
      set(state => ({
        issues: state.issues.map(issue => 
          issue.id === issueId 
            ? { ...issue, votes: voteData.newVoteCount, userVote: null }
            : issue
        ),
        currentIssue: state.currentIssue?.id === issueId 
          ? { ...state.currentIssue, votes: voteData.newVoteCount, userVote: null }
          : state.currentIssue,
        isLoading: false,
        error: null
      }));
      
      return voteData;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to remove vote'
      });
      throw error;
    }
  },

  // Update issue status (steward/admin)
  updateIssueStatus: async (issueId, status, reason) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await issueAPI.updateIssueStatus(issueId, status, reason);
      const updatedIssue = response.data?.issue || response.issue;
      
      set(state => ({
        issues: state.issues.map(issue => 
          issue.id === issueId ? updatedIssue : issue
        ),
        currentIssue: state.currentIssue?.id === issueId ? updatedIssue : state.currentIssue,
        isLoading: false,
        error: null
      }));
      
      return updatedIssue;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to update issue status'
      });
      throw error;
    }
  },

  // Archive issue (soft delete)
  archiveIssue: async (issueId, archiveData) => {
    set({ isLoading: true, error: null });
    
    try {
      await issueAPI.archiveIssue(issueId, archiveData);
      
      // Remove from current list
      set(state => ({
        issues: state.issues.filter(issue => issue.id !== issueId),
        currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue,
        isLoading: false,
        error: null
      }));
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to archive issue'
      });
      throw error;
    }
  },

  // Delete issue (permanent)
  deleteIssue: async (issueId, deleteData = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      await issueAPI.hardDeleteIssue(issueId);
      
      // Remove from current list
      set(state => ({
        issues: state.issues.filter(issue => issue.id !== issueId),
        currentIssue: state.currentIssue?.id === issueId ? null : state.currentIssue,
        isLoading: false,
        error: null
      }));
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to delete issue'
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current issue
  clearCurrentIssue: () => set({ currentIssue: null }),

  // Reset store
  reset: () => set({
    issues: [],
    categories: [],
    zones: [],
    currentIssue: null,
    isLoading: false,
    error: null,
    pagination: null,
    filters: {
      category: null,
      zone: null,
      status: null,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }),
}));

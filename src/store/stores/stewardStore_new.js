import { create } from 'zustand';
import { stewardAPI } from '../../lib/api/stewardApi';

// Steward Store - Updated for category-zone assignment system
export const useStewardStore = create((set, get) => ({
  // State
  myApplication: null,
  pendingApplications: [],
  allApplications: [],
  allStewards: [],
  myCategories: [], // Steward's assigned category-zone combinations
  myAssignedIssues: [],
  stewardStats: null,
  stewardAssignments: [], // For admin: all steward assignments
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Actions
  setMyApplication: (application) => set({ myApplication: application }),
  setPendingApplications: (applications) => set({ pendingApplications: applications }),
  setAllStewards: (stewards) => set({ allStewards: stewards }),
  setMyCategories: (categories) => set({ myCategories: categories }),
  setStewardStats: (stats) => set({ stewardStats: stats }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Submit steward application with category and zone preferences
  submitApplication: async (applicationData) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await stewardAPI.submitApplication({
        motivation: applicationData.motivation,
        experience: applicationData.experience,
        categories: applicationData.categories, // Array of category UUIDs
        zones: applicationData.zones // Array of zone UUIDs
      });
      const newApplication = response.data?.application || response.application || response;
      set({ 
        myApplication: newApplication, 
        isSubmitting: false,
        error: null
      });
      return newApplication;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to submit application',
        isSubmitting: false 
      });
      throw error;
    }
  },

  // Fetch my application status
  fetchMyApplication: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getMyApplication();
      const applicationData = response.data?.application || response.application || response;
      set({ myApplication: applicationData, isLoading: false });
      return applicationData;
    } catch (error) {
      // Don't set error if no application exists (404 is expected)
      if (error.status === 404 || error.message.includes('not found')) {
        set({ myApplication: null, isLoading: false });
        return null;
      }
      set({ 
        error: error.message || 'Failed to load application',
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch my steward categories (replaces fetchMyZones)
  fetchMyCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getMyStewardCategories();
      const categoriesData = response.data?.categories || response.categories || [];
      set({ myCategories: categoriesData, isLoading: false });
      return categoriesData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load assigned categories',
        isLoading: false 
      });
      throw error;
    }
  },

  // Legacy method for backward compatibility
  fetchMyZones: async () => {
    return await get().fetchMyCategories();
  },

  // Fetch my assigned issues
  fetchMyAssignedIssues: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getMyAssignedIssues();
      const issuesData = response.data?.issues || response.issues || [];
      set({ myAssignedIssues: issuesData, isLoading: false });
      return issuesData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load assigned issues',
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch my steward statistics
  fetchMyStewardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getMyStewardStats();
      const statsData = response.data?.stats || response.stats || response;
      set({ stewardStats: statsData, isLoading: false });
      return statsData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load steward statistics',
        isLoading: false 
      });
      throw error;
    }
  },

  // Admin: Fetch pending applications
  fetchPendingApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getPendingApplications();
      const applicationsData = response.data?.applications || response.applications || [];
      set({ pendingApplications: applicationsData, isLoading: false });
      return applicationsData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load pending applications',
        isLoading: false 
      });
      throw error;
    }
  },

  // Admin: Review application
  reviewApplication: async (applicationId, reviewData) => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.reviewApplication(applicationId, {
        status: reviewData.status,
        reviewNotes: reviewData.reviewNotes || reviewData.feedback
      });
      
      // Remove reviewed application from pending list
      const { pendingApplications } = get();
      const updatedApplications = pendingApplications.filter(app => app.id !== applicationId);
      set({ 
        pendingApplications: updatedApplications,
        isSubmitting: false,
        error: null
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to review application',
        isSubmitting: false 
      });
      throw error;
    }
  },

  // Admin: Fetch all stewards
  fetchAllStewards: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getAllStewards(params);
      const stewardsData = response.data?.stewards || response.stewards || [];
      set({ allStewards: stewardsData, isLoading: false });
      return stewardsData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load stewards',
        isLoading: false 
      });
      throw error;
    }
  },

  // Legacy zone assignment (kept for backward compatibility)
  assignStewardToZone: async (stewardId, zoneId) => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.assignStewardToZone(stewardId, zoneId);
      set({ isSubmitting: false, error: null });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to assign steward to zone',
        isSubmitting: false 
      });
      throw error;
    }
  },

  removeStewardFromZone: async (stewardId, zoneId) => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.removeStewardFromZone(stewardId, zoneId);
      set({ isSubmitting: false, error: null });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to remove steward from zone',
        isSubmitting: false 
      });
      throw error;
    }
  },

  // NEW Category-Zone Assignment Functions
  assignStewardToCategory: async (assignmentData) => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.assignStewardToCategory({
        stewardId: assignmentData.stewardId,
        categoryId: assignmentData.categoryId,
        zoneId: assignmentData.zoneId,
        notes: assignmentData.notes
      });
      set({ isSubmitting: false, error: null });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to assign steward to category',
        isSubmitting: false 
      });
      throw error;
    }
  },

  bulkAssignSteward: async (assignmentData) => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.bulkAssignSteward({
        stewardId: assignmentData.stewardId,
        assignments: assignmentData.assignments // Array of { categoryId, zoneId }
      });
      set({ isSubmitting: false, error: null });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to bulk assign steward',
        isSubmitting: false 
      });
      throw error;
    }
  },

  removeStewardAssignment: async (stewardId, categoryId, zoneId) => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.removeStewardAssignment(stewardId, categoryId, zoneId);
      set({ isSubmitting: false, error: null });
      return true;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to remove steward assignment',
        isSubmitting: false 
      });
      throw error;
    }
  },

  fetchStewardAssignments: async (stewardId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getStewardAssignments(stewardId);
      const assignmentsData = response.data?.assignments || response.assignments || [];
      set({ stewardAssignments: assignmentsData, isLoading: false });
      return assignmentsData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load steward assignments',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchAllStewardAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getAllStewardAssignments();
      const assignmentsData = response.data?.assignments || response.assignments || [];
      set({ stewardAssignments: assignmentsData, isLoading: false });
      return assignmentsData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load all steward assignments',
        isLoading: false 
      });
      throw error;
    }
  },

  // Steward notes
  addNoteToIssue: async (issueId, noteData) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await stewardAPI.addStewardNote(issueId, {
        note: noteData.note,
        isInternal: noteData.isInternal || false,
        priority: noteData.priority || 'medium'
      });
      const noteResult = response.data?.note || response.note || response;
      set({ isSubmitting: false, error: null });
      return noteResult;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to add note',
        isSubmitting: false 
      });
      throw error;
    }
  },

  fetchStewardNotes: async (issueId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getStewardNotes(issueId);
      const notesData = response.data?.notes || response.notes || [];
      set({ isLoading: false, error: null });
      return notesData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load steward notes',
        isLoading: false 
      });
      throw error;
    }
  },

  // Reset store
  reset: () => set({
    myApplication: null,
    pendingApplications: [],
    allApplications: [],
    allStewards: [],
    myCategories: [],
    myAssignedIssues: [],
    stewardStats: null,
    stewardAssignments: [],
    isLoading: false,
    isSubmitting: false,
    error: null
  }),
}));

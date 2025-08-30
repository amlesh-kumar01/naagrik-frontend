import { create } from 'zustand';
import { stewardAPI } from '../../lib/api';

// Steward Store - for managing steward applications and admin functions
export const useStewardStore = create((set, get) => ({
  // State
  myApplication: null,
  pendingApplications: [],
  allStewards: [],
  myZones: [],
  stewardStats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Actions
  setMyApplication: (application) => set({ myApplication: application }),
  setPendingApplications: (applications) => set({ pendingApplications: applications }),
  setAllStewards: (stewards) => set({ allStewards: stewards }),
  setMyZones: (zones) => set({ myZones: zones }),
  setStewardStats: (stats) => set({ stewardStats: stats }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Submit steward application
  submitApplication: async (justification) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await stewardAPI.submitApplication(justification);
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

  // Fetch my steward zones
  fetchMyZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getMyZones();
      const zonesData = response.data?.zones || response.zones || [];
      set({ myZones: zonesData, isLoading: false });
      return zonesData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load zones',
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
  reviewApplication: async (applicationId, status, feedback = '') => {
    set({ isSubmitting: true, error: null });
    try {
      await stewardAPI.reviewApplication(applicationId, status, feedback);
      
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
  fetchAllStewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await stewardAPI.getAllStewards();
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

  // Admin: Assign steward to zone
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

  // Admin: Remove steward from zone
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

  // Add steward note to issue
  addNoteToIssue: async (issueId, note) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await stewardAPI.addStewardNote(issueId, note);
      const noteData = response.data?.note || response.note || response;
      set({ isSubmitting: false, error: null });
      return noteData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to add note',
        isSubmitting: false 
      });
      throw error;
    }
  },

  // Get steward notes for issue
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
    allStewards: [],
    myZones: [],
    stewardStats: null,
    isLoading: false,
    isSubmitting: false,
    error: null
  })
}));

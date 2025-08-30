import { create } from 'zustand';
import { badgeAPI } from '../../lib/api/badgeApi';

export const useBadgeStore = create((set, get) => ({
  // State
  badges: [],
  currentBadge: null,
  badgeHolders: [],
  badgeStats: null,
  isLoading: false,
  error: null,

  // Actions
  fetchAllBadges: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.getAllBadges();
      const badges = response.data?.badges || response.badges || [];
      set({ badges, isLoading: false });
      return { success: true, badges };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch badges';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchBadgeDetails: async (badgeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.getBadgeDetails(badgeId);
      const badge = response.data?.badge || response.badge;
      set({ currentBadge: badge, isLoading: false });
      return { success: true, badge };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch badge details';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createBadge: async (badgeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.createBadge(badgeData);
      const newBadge = response.data?.badge || response.badge;
      
      // Update badges list
      const { badges } = get();
      set({ 
        badges: [...badges, newBadge], 
        isLoading: false 
      });
      
      return { success: true, badge: newBadge };
    } catch (error) {
      const errorMessage = error.message || 'Failed to create badge';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateBadge: async (badgeId, badgeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.updateBadge(badgeId, badgeData);
      const updatedBadge = response.data?.badge || response.badge;
      
      // Update badges list
      const { badges } = get();
      const updatedBadges = badges.map(badge => 
        badge.id === badgeId ? updatedBadge : badge
      );
      
      set({ 
        badges: updatedBadges,
        currentBadge: updatedBadge,
        isLoading: false 
      });
      
      return { success: true, badge: updatedBadge };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update badge';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteBadge: async (badgeId) => {
    set({ isLoading: true, error: null });
    try {
      await badgeAPI.deleteBadge(badgeId);
      
      // Remove from badges list
      const { badges } = get();
      const filteredBadges = badges.filter(badge => badge.id !== badgeId);
      
      set({ 
        badges: filteredBadges,
        currentBadge: null,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete badge';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  awardBadge: async (userId, badgeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.awardBadge({ userId, badgeId });
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to award badge';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  removeBadge: async (userId, badgeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.removeBadge({ userId, badgeId });
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove badge';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchBadgeHolders: async (badgeId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.getBadgeHolders(badgeId, params);
      const holders = response.data?.holders || response.holders || [];
      set({ badgeHolders: holders, isLoading: false });
      return { success: true, holders };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch badge holders';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchBadgeStats: async (badgeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await badgeAPI.getBadgeStats(badgeId);
      const stats = response.data?.stats || response.stats;
      set({ badgeStats: stats, isLoading: false });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch badge statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentBadge: () => set({ currentBadge: null, badgeHolders: [], badgeStats: null }),
}));

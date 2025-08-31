import { create } from 'zustand';
import { zoneAPI } from '../../lib/api/zoneApi';

export const useZoneStore = create((set, get) => ({
  // State
  zones: [],
  availableZones: [], // Public zones for issue creation
  currentZone: null,
  zoneStats: null,
  zoneIssues: [],
  zoneStewards: [],
  isLoading: false,
  error: null,

  // Public Actions (for issue creation)
  fetchAvailableZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.getAvailableZones();
      const zones = response.data?.zones || response.zones || [];
      console.log("Fetched zones array: ", zones);
      set({ availableZones: zones, isLoading: false });
      return { success: true, zones };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch available zones';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  searchZones: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.searchZones(query);
      const zones = response.data?.zones || response.zones || [];
      set({ availableZones: zones, isLoading: false });
      return { success: true, zones };
    } catch (error) {
      const errorMessage = error.message || 'Failed to search zones';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Admin Actions
  fetchAllZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.getAllZones();
      const zones = response.data?.zones || response.zones || [];
      set({ zones, isLoading: false });
      return { success: true, zones };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch zones';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchZoneDetails: async (zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.getZoneDetails(zoneId);
      const zone = response.data?.zone || response.zone;
      set({ currentZone: zone, isLoading: false });
      return { success: true, zone };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch zone details';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  createZone: async (zoneData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.createZone(zoneData);
      const newZone = response.data?.zone || response.zone;
      
      // Update zones list
      const { zones } = get();
      set({ 
        zones: [...zones, newZone], 
        isLoading: false 
      });
      
      return { success: true, zone: newZone };
    } catch (error) {
      const errorMessage = error.message || 'Failed to create zone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateZone: async (zoneId, zoneData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.updateZone(zoneId, zoneData);
      const updatedZone = response.data?.zone || response.zone;
      
      // Update zones list
      const { zones } = get();
      const updatedZones = zones.map(zone => 
        zone.id === zoneId ? updatedZone : zone
      );
      
      set({ 
        zones: updatedZones,
        currentZone: updatedZone,
        isLoading: false 
      });
      
      return { success: true, zone: updatedZone };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update zone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteZone: async (zoneId) => {
    set({ isLoading: true, error: null });
    try {
      await zoneAPI.deleteZone(zoneId);
      
      // Remove from zones list
      const { zones } = get();
      const filteredZones = zones.filter(zone => zone.id !== zoneId);
      
      set({ 
        zones: filteredZones,
        currentZone: null,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete zone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchZoneStats: async (zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.getZoneStats(zoneId);
      const stats = response.data?.stats || response.stats;
      set({ zoneStats: stats, isLoading: false });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch zone statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchZoneIssues: async (zoneId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.getZoneIssues(zoneId, params);
      const issues = response.data?.issues || response.issues || [];
      set({ zoneIssues: issues, isLoading: false });
      return { success: true, issues };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch zone issues';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchZoneStewards: async (zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await zoneAPI.getZoneStewards(zoneId);
      const stewards = response.data?.stewards || response.stewards || [];
      set({ zoneStewards: stewards, isLoading: false });
      return { success: true, stewards };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch zone stewards';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentZone: () => set({ currentZone: null, zoneStats: null, zoneIssues: [], zoneStewards: [] }),

  // Category management actions
  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.createCategory(categoryData);
      const newCategory = response.data?.category || response.category;
      
      // Update categories list
      const { categories } = get();
      set({ 
        categories: [...categories, newCategory], 
        isLoading: false 
      });
      
      return { success: true, category: newCategory };
    } catch (error) {
      const errorMessage = error.message || 'Failed to create category';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryAPI.updateCategory(categoryId, categoryData);
      const updatedCategory = response.data?.category || response.category;
      
      // Update categories list
      const { categories } = get();
      const updatedCategories = categories.map(category => 
        category.id === categoryId ? updatedCategory : category
      );
      
      set({ 
        categories: updatedCategories,
        isLoading: false 
      });
      
      return { success: true, category: updatedCategory };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update category';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteCategory: async (categoryId) => {
    set({ isLoading: true, error: null });
    try {
      await categoryAPI.deleteCategory(categoryId);
      
      // Remove from categories list
      const { categories } = get();
      const filteredCategories = categories.filter(category => category.id !== categoryId);
      
      set({ 
        categories: filteredCategories,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete category';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },
}));

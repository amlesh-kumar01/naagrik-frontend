import { create } from 'zustand';
import { dashboardAPI } from '../../lib/api/dashboardApi';

export const useDashboardStore = create((set, get) => ({
  // State
  publicStats: null,
  issueTrends: [],
  topIssues: [],
  categoryStats: [],
  issueDistribution: [],
  adminOverview: null,
  stewardDashboard: null,
  stewardWorkload: null,
  criticalIssues: [],
  userActivity: null,
  stewardPerformance: [],
  resolutionTimeStats: null,
  isLoading: false,
  error: null,

  // Actions
  fetchPublicStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getPublicStats();
      const stats = response.data?.stats || response.stats;
      set({ publicStats: stats, isLoading: false });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch public statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchIssueTrends: async (days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getIssueTrends(days);
      const trends = response.data?.trends || response.trends || [];
      set({ issueTrends: trends, isLoading: false });
      return { success: true, trends };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch issue trends';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchTopIssues: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getTopIssues(limit);
      const issues = response.data?.issues || response.issues || [];
      set({ topIssues: issues, isLoading: false });
      return { success: true, issues };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch top issues';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchCategoryStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getCategoryStats();
      const stats = response.data?.categories || response.categories || [];
      set({ categoryStats: stats, isLoading: false });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch category statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchIssueDistribution: async (limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getIssueDistribution(limit);
      const distribution = response.data?.distribution || response.distribution || [];
      set({ issueDistribution: distribution, isLoading: false });
      return { success: true, distribution };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch issue distribution';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchAdminOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getAdminOverview();
      const overview = response.data;
      set({ adminOverview: overview, isLoading: false });
      return { success: true, overview };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch admin overview';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchStewardDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getStewardDashboard();
      const dashboard = response.data;
      set({ stewardDashboard: dashboard, isLoading: false });
      return { success: true, dashboard };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch steward dashboard';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchStewardWorkload: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getStewardWorkload();
      const workload = response.data?.workload || response.workload;
      set({ stewardWorkload: workload, isLoading: false });
      return { success: true, workload };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch steward workload';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchCriticalIssues: async (type = 'steward') => {
    set({ isLoading: true, error: null });
    try {
      const response = type === 'admin' 
        ? await dashboardAPI.getAdminCriticalIssues()
        : await dashboardAPI.getStewardCriticalIssues();
      const issues = response.data?.issues || response.issues || [];
      set({ criticalIssues: issues, isLoading: false });
      return { success: true, issues };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch critical issues';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUserActivity: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getAdminUserActivity();
      const activity = response.data?.activity || response.activity;
      set({ userActivity: activity, isLoading: false });
      return { success: true, activity };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch user activity';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchStewardPerformance: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getAdminStewardPerformance(limit);
      const performance = response.data?.performance || response.performance || [];
      set({ stewardPerformance: performance, isLoading: false });
      return { success: true, performance };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch steward performance';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchResolutionTimeStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getAdminResolutionTimeStats();
      const stats = response.data?.stats || response.stats;
      set({ resolutionTimeStats: stats, isLoading: false });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch resolution time statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchSpecificStewardWorkload: async (stewardId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardAPI.getAdminStewardWorkload(stewardId);
      const workload = response.data?.workload || response.workload;
      set({ isLoading: false });
      return { success: true, workload };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch steward workload';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  
  // Helper to fetch all dashboard data at once
  fetchAllDashboardData: async (userRole) => {
    const promises = [get().fetchPublicStats()];
    
    if (userRole === 'SUPER_ADMIN') {
      promises.push(
        get().fetchAdminOverview(),
        get().fetchUserActivity(),
        get().fetchStewardPerformance(),
        get().fetchResolutionTimeStats(),
        get().fetchCriticalIssues('admin')
      );
    } else if (userRole === 'STEWARD') {
      promises.push(
        get().fetchStewardDashboard(),
        get().fetchStewardWorkload(),
        get().fetchCriticalIssues('steward')
      );
    }
    
    promises.push(
      get().fetchIssueTrends(),
      get().fetchTopIssues(),
      get().fetchCategoryStats()
    );
    
    try {
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
}));

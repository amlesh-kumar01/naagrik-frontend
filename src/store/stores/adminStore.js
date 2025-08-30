import { create } from 'zustand';
import { adminAPI } from '../../lib/api/adminApi';

export const useAdminStore = create((set, get) => ({
  // State
  users: [],
  userStatistics: null,
  stewards: [],
  selectedUser: null,
  userActivity: null,
  userHistory: [],
  isLoading: false,
  error: null,

  // User Management Actions
  fetchAllUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getAllUsers(params);
      const users = response.data?.users || response.users || [];
      set({ users, isLoading: false });
      return { success: true, users };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchFilteredUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getFilteredUsers(params);
      const users = response.data?.users || response.users || [];
      set({ users, isLoading: false });
      return { success: true, users };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch filtered users';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUserStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getUserStatistics();
      const statistics = response.data?.statistics || response.statistics;
      set({ userStatistics: statistics, isLoading: false });
      return { success: true, statistics };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch user statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUserActivity: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getUserActivity(userId);
      const activity = response.data?.activity || response.activity;
      set({ userActivity: activity, isLoading: false });
      return { success: true, activity };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch user activity';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchUserHistory: async (userId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getUserHistory(userId, params);
      const history = response.data?.history || response.history || [];
      set({ userHistory: history, isLoading: false });
      return { success: true, history };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch user history';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateUserReputation: async (userId, change, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.updateUserReputation(userId, { change, reason });
      
      // Update user in the users list
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, reputation: (user.reputation || 0) + change }
          : user
      );
      
      set({ users: updatedUsers, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update user reputation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateUserStatus: async (userId, suspended, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.updateUserStatus(userId, { suspended, reason });
      
      // Update user in the users list
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { ...user, suspended }
          : user
      );
      
      set({ users: updatedUsers, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update user status';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  bulkUpdateUserRoles: async (userIds, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.bulkUpdateUserRoles({ userIds, role });
      
      // Update users in the list
      const { users } = get();
      const updatedUsers = users.map(user => 
        userIds.includes(user.id) 
          ? { ...user, role }
          : user
      );
      
      set({ users: updatedUsers, isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to bulk update user roles';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Steward Management Actions
  fetchAllStewards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getAllStewards();
      const stewards = response.data?.stewards || response.stewards || [];
      set({ stewards, isLoading: false });
      return { success: true, stewards };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch stewards';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  assignStewardToZone: async (stewardId, zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.assignStewardToZone({ stewardId, zoneId });
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to assign steward to zone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  removeStewardFromZone: async (stewardId, zoneId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.removeStewardFromZone({ stewardId, zoneId });
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove steward from zone';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  fetchStewardStats: async (stewardId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.getStewardStats(stewardId);
      const stats = response.data?.stats || response.stats;
      set({ isLoading: false });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch steward statistics';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Bulk Operations
  bulkUpdateIssueStatus: async (issueIds, status, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminAPI.bulkUpdateIssueStatus({ issueIds, status, reason });
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to bulk update issue status';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Utility Actions
  setSelectedUser: (user) => set({ selectedUser: user }),
  clearSelectedUser: () => set({ selectedUser: null, userActivity: null, userHistory: [] }),
  clearError: () => set({ error: null }),
}));

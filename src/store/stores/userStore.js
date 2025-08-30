import { create } from 'zustand';
import { userAPI, uploadAPI } from '../../lib/api';

// User Store - for managing user profile, stats, and badges
export const useUserStore = create((set, get) => ({
  // State
  profile: null,
  stats: null,
  badges: [],
  isLoading: false,
  isUploading: false,
  error: null,

  // Actions
  setProfile: (profile) => set({ profile }),
  setStats: (stats) => set({ stats }),
  setBadges: (badges) => set({ badges }),
  setLoading: (loading) => set({ isLoading: loading }),
  setUploading: (uploading) => set({ isUploading: uploading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch user profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.getProfile();
      const profileData = response.data?.user || response.user || response;
      set({ profile: profileData, isLoading: false });
      return profileData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load profile',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.updateProfile(profileData);
      const updatedProfile = response.data?.user || response.user || response;
      set({ profile: updatedProfile, isLoading: false });
      return updatedProfile;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to update profile',
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch user statistics
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.getMyStats();
      const statsData = response.data || response;
      set({ stats: statsData, isLoading: false });
      return statsData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load statistics',
        isLoading: false 
      });
      throw error;
    }
  },

  // Fetch user badges
  fetchBadges: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userAPI.getMyBadges();
      const badgesData = response.data?.badges || response.badges || [];
      set({ badges: badgesData, isLoading: false });
      return badgesData;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load badges',
        isLoading: false 
      });
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    set({ isUploading: true, error: null });
    try {
      // Validate file
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }

      const response = await uploadAPI.uploadProfileImage(imageFile);
      const imageUrl = response.data?.url || response.url;
      
      // Update profile with new image
      const { profile } = get();
      const updatedProfile = { ...profile, profileImage: imageUrl };
      set({ profile: updatedProfile, isUploading: false });
      
      return imageUrl;
    } catch (error) {
      set({ 
        error: error.message || 'Failed to upload image',
        isUploading: false 
      });
      throw error;
    }
  },

  // Fetch all profile data
  fetchAllProfileData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [profileRes, statsRes, badgesRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getMyStats(),
        userAPI.getMyBadges()
      ]);

      const profileData = profileRes.data?.user || profileRes.user || profileRes;
      const statsData = statsRes.data || statsRes;
      const badgesData = badgesRes.data?.badges || badgesRes.badges || [];

      set({ 
        profile: profileData,
        stats: statsData,
        badges: badgesData,
        isLoading: false,
        error: null
      });

      return { profile: profileData, stats: statsData, badges: badgesData };
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load profile data',
        isLoading: false 
      });
      throw error;
    }
  },

  // Reset store
  reset: () => set({
    profile: null,
    stats: null,
    badges: [],
    isLoading: false,
    isUploading: false,
    error: null
  })
}));

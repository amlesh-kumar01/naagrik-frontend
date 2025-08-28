import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setAuthToken, removeAuthToken } from '../../lib/api';

// Auth Store (exactly from original index.js)
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
          const { user, token } = response.data;
          
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
        // Get token from the persisted state or localStorage
        const persistedData = typeof window !== 'undefined' ? localStorage.getItem('naagrik-auth') : null;
        let token = null;

        if (persistedData) {
          try {
            const parsed = JSON.parse(persistedData);
            token = parsed.state?.token;
          } catch (e) {
            console.error('Failed to parse persisted auth data:', e);
          }
        }

        if (!token) return;

        set({ isLoading: true });
        try {
          setAuthToken(token);
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
          console.error('Failed to initialize auth:', error);
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
      name: 'naagrik-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, if we have a token, set the auth token for API calls
        if (state?.token) {
          setAuthToken(state.token);
          // Optionally verify the token is still valid
          state.initializeAuth?.();
        }
      },
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setAuthToken, removeAuthToken } from '../../lib/api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          // Backend returns { success: true, data: { token: "...", refreshToken: "...", user: {...} } }
          const { user, token, refreshToken } = response.data;
          
          setAuthToken(token);
          set({ 
            user, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null,
            rememberMe
          });
          
          return { success: true, data: { user, token, refreshToken } };
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
          // Backend returns { success: true, data: { token: "...", refreshToken: "...", user: {...} } }
          const { user, token, refreshToken } = response.data;
          
          setAuthToken(token);
          set({ 
            user, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          return { success: true, data: { user, token, refreshToken } };
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

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await authAPI.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with local logout even if API call fails
        }
        
        removeAuthToken();
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
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

      // Refresh token functionality
      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await authAPI.refreshToken(refreshToken);
          // Backend returns { success: true, data: { token: "...", refreshToken: "..." } }
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          setAuthToken(newToken);
          set({ 
            token: newToken, 
            refreshToken: newRefreshToken,
            error: null 
          });
          
          return { success: true, token: newToken };
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, logout the user
          get().logout();
          return { success: false, error: error.message };
        }
      },

      // Initialize auth state from token
      initializeAuth: async () => {
        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('naagrik-token') : null;

        if (!token) return;

        set({ isLoading: true });
        try {
          setAuthToken(token);
          const response = await authAPI.getMe();
          // Backend returns { success: true, data: { user: {...} } }
          const user = response.data?.user || response.user;
          
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
            refreshToken: null,
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
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe
      }),
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          
          // Check if user wants to be remembered
          const data = localStorage.getItem(name) || sessionStorage.getItem(name);
          return data;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          
          try {
            const data = JSON.parse(value);
            const shouldRemember = data?.state?.rememberMe;
            
            if (shouldRemember) {
              localStorage.setItem(name, value);
              sessionStorage.removeItem(name);
            } else {
              sessionStorage.setItem(name, value);
              localStorage.removeItem(name);
            }
          } catch (error) {
            // Fallback to localStorage
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        }
      },
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

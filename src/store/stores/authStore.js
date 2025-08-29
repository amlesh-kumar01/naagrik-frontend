import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setAuthToken, removeAuthToken } from '../../lib/api';

// Auth Store (exactly from original index.js)
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
          
          // Store rememberMe preference for persistence configuration
          const authData = { 
            user, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null,
            rememberMe
          };
          
          set(authData);
          
          // If remember me is not checked, store tokens in sessionStorage instead of localStorage
          if (!rememberMe && typeof window !== 'undefined') {
            // Move tokens to sessionStorage for shorter persistence
            const persistedData = localStorage.getItem('naagrik-auth');
            if (persistedData) {
              sessionStorage.setItem('naagrik-auth', persistedData);
              localStorage.removeItem('naagrik-auth');
            }
          }
          
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
        // Clear both localStorage and sessionStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('naagrik-auth');
          sessionStorage.removeItem('naagrik-auth');
        }
        
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false,
          rememberMe: false,
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
        // Get token from persisted state (localStorage or sessionStorage)
        let persistedData = null;
        let token = null;
        let refreshToken = null;
        
        if (typeof window !== 'undefined') {
          persistedData = localStorage.getItem('naagrik-auth') || sessionStorage.getItem('naagrik-auth');
        }

        if (persistedData) {
          try {
            const parsed = JSON.parse(persistedData);
            token = parsed.state?.token;
            refreshToken = parsed.state?.refreshToken;
          } catch (e) {
            console.error('Failed to parse persisted auth data:', e);
          }
        }

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
            refreshToken,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // Try to refresh token if available
          if (refreshToken) {
            try {
              const refreshResult = await get().refreshAuthToken();
              if (refreshResult.success) {
                // Retry getting user profile with new token
                const response = await authAPI.getMe();
                const user = response.data?.user || response.user;
                set({ 
                  user, 
                  isAuthenticated: true, 
                  isLoading: false 
                });
                return;
              }
            } catch (refreshError) {
              console.error('Token refresh during initialization failed:', refreshError);
            }
          }
          
          // If everything fails, clear auth state
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
          // Try localStorage first, then sessionStorage
          if (typeof window === 'undefined') return null;
          
          const localStorage_data = localStorage.getItem(name);
          if (localStorage_data) return localStorage_data;
          
          const sessionStorage_data = sessionStorage.getItem(name);
          return sessionStorage_data || null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          
          try {
            const data = JSON.parse(value);
            const shouldRemember = data?.state?.rememberMe;
            
            if (shouldRemember) {
              // Store in localStorage for persistent login
              localStorage.setItem(name, value);
              // Remove from sessionStorage if it exists
              sessionStorage.removeItem(name);
            } else {
              // Store in sessionStorage for session-only login
              sessionStorage.setItem(name, value);
              // Remove from localStorage if it exists
              localStorage.removeItem(name);
            }
          } catch (error) {
            console.error('Error storing auth data:', error);
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

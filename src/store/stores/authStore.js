import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, setAuthToken, removeAuthToken } from '../../lib/api';

// Helper function to validate and clean auth data
const validateAndCleanAuthData = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const authData = localStorage.getItem('naagrik-auth') || sessionStorage.getItem('naagrik-auth');
    if (authData && (authData === '[object Object]' || authData.startsWith('[object'))) {
      console.warn('Corrupted auth data detected, cleaning up...');
      localStorage.removeItem('naagrik-auth');
      sessionStorage.removeItem('naagrik-auth');
      localStorage.removeItem('naagrik-token');
      return null;
    }
    return authData;
  } catch (error) {
    console.error('Error validating auth data:', error);
    localStorage.removeItem('naagrik-auth');
    sessionStorage.removeItem('naagrik-auth');
    localStorage.removeItem('naagrik-token');
    return null;
  }
};

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
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

        if (!token) {
          set({ isInitialized: true });
          return;
        }

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
            isLoading: false,
            isInitialized: true
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          removeAuthToken();
          set({ 
            user: null, 
            token: null, 
            refreshToken: null,
            isAuthenticated: false, 
            isLoading: false,
            isInitialized: true
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
          
          // Validate and clean any corrupted data first
          const cleanData = validateAndCleanAuthData();
          if (!cleanData) return null;
          
          // Check if user wants to be remembered
          const data = localStorage.getItem(name) || sessionStorage.getItem(name);
          
          // Additional validation
          if (data && (data === '[object Object]' || data.startsWith('[object'))) {
            console.warn('Detected corrupted auth data, cleaning up...');
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
            return null;
          }
          
          return data;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          
          let stringValue = value;
          
          // Handle both string and object inputs (Zustand can pass either)
          if (typeof value === 'object' && value !== null) {
            try {
              stringValue = JSON.stringify(value);
            } catch (error) {
              console.error('Error stringifying value for storage:', error);
              return;
            }
          } else if (typeof value !== 'string') {
            console.error('Invalid value type for storage:', typeof value);
            return;
          }
          
          // Validate that stringified value is not corrupted
          if (stringValue === '[object Object]' || stringValue.startsWith('[object')) {
            console.error('Corrupted value detected for storage, skipping');
            return;
          }
          
          try {
            // Parse to get the data structure
            const data = JSON.parse(stringValue);
            const shouldRemember = data?.state?.rememberMe;
            
            if (shouldRemember) {
              localStorage.setItem(name, stringValue);
              sessionStorage.removeItem(name);
            } else {
              sessionStorage.setItem(name, stringValue);
              localStorage.removeItem(name);
            }
          } catch (error) {
            console.error('Error processing data for storage:', error);
            // Fallback to localStorage if we can parse it
            try {
              JSON.parse(stringValue); // Validate it's valid JSON
              localStorage.setItem(name, stringValue);
            } catch (parseError) {
              console.error('Invalid JSON, not storing:', parseError);
            }
          }
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        }
      },
      onRehydrateStorage: () => (state) => {
        // Validate auth data on rehydration
        validateAndCleanAuthData();
        
        // After rehydration, if we have a token, set the auth token for API calls
        if (state?.token && typeof state.token === 'string') {
          setAuthToken(state.token);
          // Optionally verify the token is still valid
          state.initializeAuth?.();
        } else if (state?.token) {
          // If token exists but is not a string, clean up
          console.warn('Invalid token detected during rehydration, cleaning up...');
          removeAuthToken();
          // Mark as initialized even if cleanup was needed
          if (state) {
            state.isInitialized = true;
          }
        } else {
          // No token found, mark as initialized
          if (state) {
            state.isInitialized = true;
          }
        }
      },
    }
  )
);

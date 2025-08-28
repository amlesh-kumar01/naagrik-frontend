'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../store';

const AuthInitializer = () => {
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state when the app starts
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [initializeAuth]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;

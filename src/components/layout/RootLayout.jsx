'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store';
import Header from './Header';
import Footer from './Footer';
import { LoadingPage } from '../ui/loading';

export default function RootLayout({ children }) {
  const { user, token, loading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check authentication on app load
    checkAuth();
  }, [checkAuth]);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/about', '/'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  if (loading) {
    return <LoadingPage message="Loading CivicConnect..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}

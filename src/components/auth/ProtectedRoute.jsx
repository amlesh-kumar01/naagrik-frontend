'use client';

import { useAuthStore } from '../../store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingPage } from '../ui/loading';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, isLoading, token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run redirect logic after component has mounted (client-side)
    if (!mounted || isLoading) return;

    // Check for authentication requirements
    if (requireAuth && !token && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check for role-based access
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [mounted, user, isLoading, token, isAuthenticated, router, allowedRoles, requireAuth]);

  // Show loading while mounting or during auth checks
  if (!mounted || isLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // For pages that require auth, check if user is authenticated
  if (requireAuth && !token && !isAuthenticated) {
    return <LoadingPage message="Redirecting to login..." />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <LoadingPage message="Unauthorized access..." />;
  }

  return children;
};

export default ProtectedRoute;

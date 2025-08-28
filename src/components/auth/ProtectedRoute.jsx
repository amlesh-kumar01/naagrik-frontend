'use client';

import { useAuthStore } from '../../store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingPage } from '../ui/loading';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, isLoading, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !token) {
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, token, router, allowedRoles, requireAuth]);

  if (isLoading) {
    return <LoadingPage message="Checking authentication..." />;
  }

  if (requireAuth && !token) {
    return <LoadingPage message="Redirecting to login..." />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <LoadingPage message="Unauthorized access..." />;
  }

  return children;
};

export default ProtectedRoute;

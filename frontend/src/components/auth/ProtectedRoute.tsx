'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
    
    if (!isLoading && isAuthenticated && requiredRole && user) {
      if (requiredRole === 'admin' && user.role !== 'admin') {
        router.push('/dashboard/feed');
      }
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole && requiredRole === 'admin') {
    return null;
  }

  return <>{children}</>;
}
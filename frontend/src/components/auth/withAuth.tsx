'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'editor' | 'viewer'
) {
  return function ProtectedRoute(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        // If not logged in, redirect to login
        if (!isAuthenticated) {
          router.push('/auth/login');
          return;
        }
        
        // Check role requirements if specified
        if (requiredRole && user) {
          // Admin can access everything
          if (user.role === 'admin') {
            // Admin accessing non-admin route, let them through
            return;
          }
          
          // Non-admin trying to access admin route
          if (requiredRole === 'admin' && user.role !== 'admin') {
            router.push('/dashboard/feed');
            return;
          }
          
          // Editor trying to access admin route
          if (requiredRole === 'admin' && user.role === 'editor') {
            router.push('/dashboard/feed');
            return;
          }
        }
      }
    }, [isLoading, isAuthenticated, user, router, requiredRole]);

    // Show loading spinner while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      );
    }

    // Don't render anything during redirect
    if (!isAuthenticated) {
      return null;
    }

    // Don't render if user doesn't have required role
    if (requiredRole === 'admin' && user?.role !== 'admin') {
      return null;
    }

    // User is authenticated and has correct role, render the protected component
    return <Component {...props} />;
  };
}
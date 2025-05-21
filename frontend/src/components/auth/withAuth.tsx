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
      // If not logged in, redirect to login
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      // User is authenticated, now check roles
      if (!isLoading && isAuthenticated && user) {
        // Check role requirements if specified
        if (requiredRole) {
          // If specific role required but user doesn't have it
          if (user.role !== requiredRole) {
            // Redirect based on user's actual role
            if (user.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/dashboard/feed');
            }
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
    if (requiredRole && user?.role !== requiredRole) {
      return null;
    }

    // User is authenticated and has correct role, render the protected component
    return <Component {...props} />;
  };
}
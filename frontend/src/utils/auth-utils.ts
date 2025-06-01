export const getRedirectPath = (role: string | undefined): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'editor':
      case 'viewer':
      default:
        return '/dashboard/feed';
    }
  };
  
  export const hasAccess = (userRole: string | undefined, requiredRole: string): boolean => {
    if (!userRole) return false;
    
    // Admin has access to everything
    if (userRole === 'admin') return true;
    
    // Check specific role requirements
    if (requiredRole === 'admin') return userRole === 'admin';
    if (requiredRole === 'editor') return userRole === 'admin' || userRole === 'editor';
    if (requiredRole === 'viewer') return true; // All authenticated users can view
    
    return false;
  };
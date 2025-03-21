import React, { useEffect, useCallback, memo } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Loading component extracted to prevent re-renders
const LoadingSpinner = memo(() => {
  console.log('[LoadingSpinner] Rendering');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

const ProtectedRoute: React.FC<ProtectedRouteProps> = memo(({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [safeToRender, setSafeToRender] = React.useState(false);

  // Debug logging for auth state changes
  useEffect(() => {
    console.log('[ProtectedRoute] Auth state changed:', {
      isLoading,
      hasUser: !!user,
      pathname: location.pathname,
      safeToRender
    });
    
    // Only mark as safe to render after we've confirmed the auth state
    if (!isLoading) {
      setSafeToRender(true);
    }
  }, [user, isLoading, location.pathname, safeToRender]);

  // Memoize the toast callback
  const showAuthError = useCallback(() => {
    console.log('[ProtectedRoute] Showing auth error toast');
    toast.error('Please sign in to continue', {
      action: {
        label: 'Sign In',
        onClick: () => {
          console.log('[ProtectedRoute] Toast action clicked, navigating to login');
          navigate('/login', { 
            state: { from: location.pathname },
            replace: true 
          });
        }
      }
    });
  }, [navigate, location.pathname]);

  useEffect(() => {
    let mounted = true;

    if (!isLoading && !user && mounted && safeToRender) {
      console.log('[ProtectedRoute] No user detected, showing auth error');
      // Wait a tick to ensure all state updates are processed
      setTimeout(() => {
        if (mounted) {
          showAuthError();
        }
      }, 0);
    }

    return () => {
      console.log('[ProtectedRoute] Component unmounting');
      mounted = false;
    };
  }, [user, isLoading, showAuthError, safeToRender]);

  if (isLoading || !safeToRender) {
    console.log('[ProtectedRoute] Showing loading spinner');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  console.log('[ProtectedRoute] User authenticated, rendering children');
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;

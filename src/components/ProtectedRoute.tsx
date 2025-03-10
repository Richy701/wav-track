
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  
  // Check if user is authenticated
  const isAuthenticated = !!user;

  useEffect(() => {
    // If we're not loading anymore, update showLoading
    if (!isLoading) {
      setShowLoading(false);
    }

    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setShowLoading(false);
      if (!isAuthenticated && !isLoading) {
        console.log('Timeout reached, redirecting to login');
        navigate('/login', { state: { from: location.pathname } });
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  useEffect(() => {
    // If authentication failed and we're not loading anymore
    if (!isAuthenticated && !isLoading && !showLoading) {
      console.log('Authentication failed, showing error toast');
      // Show a toast message
      toast.error('You need to sign in to access this page', {
        description: 'Please sign in to continue',
        action: {
          label: 'Sign In',
          onClick: () => navigate('/login', { state: { from: location.pathname } })
        }
      });
    }
  }, [isAuthenticated, isLoading, showLoading, location.pathname, navigate]);

  // If we're still loading and within the timeout window, show loading state
  if ((isLoading || showLoading) && !user) {
    console.log('Showing loading state', { isLoading, showLoading });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not authenticated and not loading, redirect to login
  if (!isAuthenticated && !isLoading) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;

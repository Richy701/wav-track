import React, { memo, useCallback, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Loading component extracted to prevent re-renders
const LoadingSpinner = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

const ProtectedRoute: React.FC<ProtectedRouteProps> = memo(({ children }) => {
  const { user, isLoading, isInitialized } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Memoize the toast callback
  const showAuthError = useCallback(() => {
    toast.error('Please sign in to continue', {
      action: {
        label: 'Sign In',
        onClick: () => {
          navigate('/login', {
            state: { from: location.pathname },
            replace: true,
          })
        },
      },
    })
  }, [navigate, location.pathname])

  useEffect(() => {
    if (!isLoading && !user && isInitialized) {
      showAuthError()
    }
  }, [user, isLoading, isInitialized, showAuthError])

  // Show loading spinner while auth is initializing
  if (isLoading || !isInitialized) {
    return <LoadingSpinner />
  }

  // Redirect to login if no user is found
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Render children if user is authenticated
  return <>{children}</>
})

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute

import React, { memo, useCallback, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// Loading component extracted to prevent re-renders
const LoadingSpinner = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner 
        variant="circle-filled" 
        size={48}
        className="text-primary mb-4"
      />
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
    // Store the current location in state for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  // Render children if user is authenticated
  return <>{children}</>
})

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute

import React, { Suspense, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './lib/ThemeContext'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import ThemeTransition from './components/ThemeTransition'
import OfflineStatus from './components/OfflineStatus'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load route components
const Login = React.lazy(() => import('./pages/Login'))
const Profile = React.lazy(() => import('./pages/Profile'))
const ProfileSettings = React.lazy(() => import('./pages/ProfileSettings'))
const Index = React.lazy(() => import('./pages/Index'))
const Callback = React.lazy(() => import('./pages/auth/Callback'))
const ScrollDemo = React.lazy(() => import('./pages/ScrollDemo'))
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const CompleteProfile = React.lazy(() => import('./pages/CompleteProfile'))

function App() {
  const [isReady, setIsReady] = useState(false)

  // Wait a short time before showing content to ensure CSS is loaded
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return <LoadingScreen message="Initializing application..." />
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center">
          Something went wrong. Please refresh the page or try again later.
        </div>
      }
    >
      <Router basename={import.meta.env.BASE_URL}>
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <ThemeTransition />
              <OfflineStatus />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <Suspense fallback={<LoadingScreen message="Loading login..." />}>
                        <Login />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/auth/callback"
                    element={
                      <Suspense fallback={<LoadingScreen message="Processing authentication..." />}>
                        <Callback />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/complete-profile"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading profile form..." />}>
                          <CompleteProfile />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading profile..." />}>
                          <Profile />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/settings"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading settings..." />}>
                          <ProfileSettings />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/scroll-demo"
                    element={
                      <Suspense fallback={<LoadingScreen />}>
                        <ScrollDemo />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/project/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading project details..." />}>
                          <ProjectDetail />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                          <Dashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                        <Index />
                      </Suspense>
                    }
                  />

                  {/* Catch-all route - Must be last */}
                  <Route
                    path="*"
                    element={
                      <div className="h-screen flex flex-col items-center justify-center p-4 text-center">
                        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
                        <p className="mb-6 text-muted-foreground">
                          The page you are looking for doesn't exist or has been moved.
                        </p>
                        <button
                          onClick={() => (window.location.href = import.meta.env.BASE_URL)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Go to Homepage
                        </button>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App

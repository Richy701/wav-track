import React, { Suspense, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './lib/ThemeContext'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import ThemeTransition from './components/ThemeTransition'
import OfflineStatus from './components/OfflineStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { prefetchDashboardData } from '@/lib/prefetch'
import { TrackList } from './components/TrackList'
import { TrackDetails } from './components/TrackDetails'
import { Track } from './types/track'
import { useQuery } from '@tanstack/react-query'
import { StatCardSkeleton } from '@/components/ui/stat-card-skeleton'
import { FadeIn } from '@/components/ui/fade-in'
import Sessions from './pages/Sessions'

// Custom lazy loading wrapper with preload support
function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const Component = React.lazy(factory) as React.LazyExoticComponent<T> & { preload?: () => Promise<{ default: T }> }
  Component.preload = factory
  return Component as React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> }
}

// Navigation wrapper component to handle prefetching
function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Prefetch dashboard data when navigating to dashboard-related routes
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      prefetchDashboardData(queryClient)
    }
  }, [location.pathname, queryClient])

  return <>{children}</>
}

// Lazy load route components with preloading
const Login = lazyWithPreload(() => import('./pages/Login'))
const Profile = lazyWithPreload(() => import('./pages/Profile'))
const ProfileSettings = lazyWithPreload(() => import('./pages/ProfileSettings'))
const Index = lazyWithPreload(() => import('./pages/Index'))
const Callback = lazyWithPreload(() => import('./pages/auth/Callback'))
const ProjectDetail = lazyWithPreload(() => import('./pages/ProjectDetail'))
const LandingPage = lazyWithPreload(() => import('./pages/LandingPage'))
const Achievements = lazyWithPreload(() => import('./pages/Achievements'))

// Preload components on hover
const preloadComponent = (component: React.LazyExoticComponent<any> & { preload: () => Promise<any> }) => {
  return () => {
    component.preload()
  }
}

function App() {
  const [isReady, setIsReady] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

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
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ThemeProvider>
              <NavigationWrapper>
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Suspense fallback={<LoadingScreen message="Loading landing page..." />}>
                          <LandingPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <Suspense fallback={<LoadingScreen message="Loading login..." />}>
                          <Login />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                            <Index />
                          </Suspense>
                        </ProtectedRoute>
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
                      path="/sessions"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingScreen message="Loading sessions..." />}>
                            <Sessions />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/project/:id"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingScreen message="Loading project..." />}>
                            <ProjectDetail />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/achievements"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingScreen message="Loading achievements..." />}>
                            <Achievements />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </NavigationWrapper>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

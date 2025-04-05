import React, { Suspense, useState, useEffect } from 'react'
import { 
  createBrowserRouter, 
  RouterProvider, 
  useLocation,
  createRoutesFromElements,
  Route,
  Outlet
} from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider, AuthNavigationProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import OfflineStatus from './components/OfflineStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchDashboardData } from '@/lib/prefetch'
import { TrackList } from './components/TrackList'
import { TrackDetails } from './components/TrackDetails'
import { Track } from './types/track'
import { useQuery } from '@tanstack/react-query'
import { StatCardSkeleton } from '@/components/ui/stat-card-skeleton'
import { FadeIn } from '@/components/ui/fade-in'
import Sessions from './pages/Sessions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DirectionProvider } from './components/providers/DirectionProvider'

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      throwOnError: true, // renamed from useErrorBoundary in v5
    },
    mutations: {
      retry: 1,
      throwOnError: true, // renamed from useErrorBoundary in v5
    },
  },
})

// Custom lazy loading wrapper with preload support
function lazyWithPreload<T extends React.ComponentType<Record<string, unknown>>>(
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
const preloadComponent = (component: React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>> & { preload: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }> }) => {
  return () => {
    component.preload()
  }
}

// Create router with future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={
        <ErrorBoundary
          fallback={
            <div className="p-8 text-center">
              Something went wrong. Please refresh the page or try again later.
            </div>
          }
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="dark" 
              enableSystem 
              disableTransitionOnChange 
              themes={['light', 'dark']}
              value={{
                light: 'light',
                dark: 'dark'
              }}
            >
              <div className="min-h-screen bg-background">
                <AuthProvider>
                  <AuthNavigationProvider>
                    <NavigationWrapper>
                      <Suspense fallback={<LoadingScreen />}>
                        <Outlet />
                      </Suspense>
                    </NavigationWrapper>
                    <Toaster />
                    <OfflineStatus />
                  </AuthNavigationProvider>
                </AuthProvider>
              </div>
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      }
    >
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
    </Route>
  ),
  {
    future: {
      v7_relativeSplatPath: true
      // Note: React Router v7 will use React.startTransition for state updates
      // We can't add v7_startTransition here due to TypeScript type constraints
    }
  }
)

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

  return <RouterProvider router={router} />
}

export default App

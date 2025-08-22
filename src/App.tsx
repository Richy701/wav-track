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
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider, AuthNavigationProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { DashboardWrapper } from './components/layout/DashboardWrapper'
import LoadingScreen from './components/LoadingScreen'
import OfflineStatus from './components/OfflineStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent'
import CookieConsentDemo from './components/CookieConsentDemo'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchDashboardData } from '@/lib/prefetch'
import { TrackList } from './components/TrackList'
import { TrackDetails } from './components/TrackDetails'
import { Track } from './types/track'
import { useQuery } from '@tanstack/react-query'
import { StatCardSkeleton } from '@/components/ui/stat-card-skeleton'
import { FadeIn } from '@/components/ui/fade-in'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DirectionProvider } from './components/providers/DirectionProvider'
import { injectCriticalCSS, CRITICAL_CSS, deferCSS } from './utils/cssLoader'

// Use the optimized QueryClient instance from query-client.ts
import { queryClient } from './lib/query-client'

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

// Lazy load route components with preloading - Optimized for bundle splitting
const Login = lazyWithPreload(() => import(/* webpackChunkName: "auth" */ './pages/Login'))
const Profile = lazyWithPreload(() => import(/* webpackChunkName: "profile" */ './pages/Profile'))
const ProfileSettings = lazyWithPreload(() => import(/* webpackChunkName: "profile" */ './pages/ProfileSettings'))
const Index = lazyWithPreload(() => import(/* webpackChunkName: "dashboard" */ './pages/Index'))
const Sessions = lazyWithPreload(() => import(/* webpackChunkName: "sessions" */ './pages/Sessions'))
const Callback = lazyWithPreload(() => import(/* webpackChunkName: "auth" */ './pages/auth/Callback'))
const ProjectDetail = lazyWithPreload(() => import(/* webpackChunkName: "project" */ './pages/ProjectDetail'))
const LandingPage = lazyWithPreload(() => import(/* webpackChunkName: "landing" */ './pages/LandingPage'))
const Achievements = lazyWithPreload(() => import(/* webpackChunkName: "achievements" */ './pages/Achievements'))
const PrivacyPolicy = lazyWithPreload(() => import(/* webpackChunkName: "legal" */ './pages/PrivacyPolicy'))
const TermsOfService = lazyWithPreload(() => import(/* webpackChunkName: "legal" */ './pages/TermsOfService'))


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
                    <CookieConsent />
                    <Analytics />
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
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                <Index />
              </Suspense>
            </DashboardWrapper>
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
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading profile..." />}>
                <Profile />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading settings..." />}>
                <ProfileSettings />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cookie-demo"
        element={
          <Suspense fallback={<LoadingScreen message="Loading demo..." />}>
            <CookieConsentDemo />
          </Suspense>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading sessions..." />}>
                <Sessions />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading project..." />}>
                <ProjectDetail />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading achievements..." />}>
                <Achievements />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading stats..." />}>
                <Index />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading goals..." />}>
                <Index />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardWrapper>
              <Suspense fallback={<LoadingScreen message="Loading settings..." />}>
                <ProfileSettings />
              </Suspense>
            </DashboardWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <Suspense fallback={<LoadingScreen message="Loading privacy policy..." />}>
            <PrivacyPolicy />
          </Suspense>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <Suspense fallback={<LoadingScreen message="Loading terms of service..." />}>
            <TermsOfService />
          </Suspense>
        }
      />

    </Route>
  ),
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true
    } as Partial<{ v7_relativeSplatPath: boolean; v7_startTransition: boolean }>
  }
)

function App() {
  const [isReady, setIsReady] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  useEffect(() => {
    // Inject critical CSS immediately for fastest render
    injectCriticalCSS(CRITICAL_CSS)
    
    // Mark app as ready immediately - no artificial delay
    setIsReady(true)
    
    // Defer non-critical CSS loading after initial render
    const deferredStyles = [
      // Add any non-critical stylesheets here if needed
    ]
    
    deferredStyles.forEach(href => deferCSS(href))
  }, [])

  if (!isReady) {
    return <div className="loading-screen">
      <div className="loading-spinner"></div>
    </div>
  }

  return <RouterProvider router={router} />
}

export default App

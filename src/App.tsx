import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/ThemeContext';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ThemeTransition from './components/ThemeTransition';
import OfflineStatus from './components/OfflineStatus';

// Lazy load route components
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProfileSettings = React.lazy(() => import('./pages/ProfileSettings'));
const Index = React.lazy(() => import('./pages/Index'));
const Callback = React.lazy(() => import('./pages/auth/Callback'));
const ScrollDemo = React.lazy(() => import('./pages/ScrollDemo'));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <ThemeTransition />
            <OfflineStatus />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/login" element={
                  <Suspense fallback={<LoadingScreen message="Loading login..." />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<LoadingScreen message="Loading registration..." />}>
                    <Register />
                  </Suspense>
                } />
                <Route path="/auth/callback" element={
                  <Suspense fallback={<LoadingScreen message="Processing authentication..." />}>
                    <Callback />
                  </Suspense>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingScreen message="Loading profile..." />}>
                      <Profile />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/profile/settings" element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingScreen message="Loading settings..." />}>
                      <ProfileSettings />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/scroll-demo" element={
                  <Suspense fallback={<LoadingScreen />}>
                    <ScrollDemo />
                  </Suspense>
                } />
                <Route path="/project/:id" element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingScreen message="Loading project detail..." />}>
                      <ProjectDetail />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/" element={
                  <Suspense fallback={<LoadingScreen message="Loading dashboard..." />}>
                    <Index />
                  </Suspense>
                } />
              </Routes>
            </Suspense>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

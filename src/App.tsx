import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/ThemeContext';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ThemeTransition from './components/ThemeTransition';

// Lazy load route components
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProfileSettings = React.lazy(() => import('./pages/ProfileSettings'));
const Index = React.lazy(() => import('./pages/Index'));
const Callback = React.lazy(() => import('./pages/auth/Callback'));
const ScrollDemo = React.lazy(() => import('./pages/ScrollDemo'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeTransition />
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/callback" element={<Callback />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/settings" element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/scroll-demo" element={<ScrollDemo />} />
                  <Route path="/" element={<Index />} />
                </Routes>
              </Suspense>
              <Toaster />
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

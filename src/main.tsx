import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // Data is fresh for 30 seconds
      // gcTime: 1000 * 60 * 5, // Cache is kept for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window gains focus
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnMount: true, // Refetch on mount
      refetchOnReconnect: true, // Refetch on reconnect
      refetchInterval: 1000 * 60, // Background refetch every minute
      refetchIntervalInBackground: true, // Continue refetching even when tab is in background
    },
  },
})

// Add detailed error logging
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Global error:', {
    message: msg,
    url: url,
    lineNo: lineNo,
    columnNo: columnNo,
    error: error
  });
  return false;
};

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// Add error boundary
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

try {
  console.log('Starting app render...');
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page</p>
      <p style="color: red; font-size: 12px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}

// Clear service worker cache in development
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  // Clear browser cache
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
}

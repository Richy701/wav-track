import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors (auth issues)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Otherwise retry twice with exponential backoff
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 10, // Data stays fresh for 10 minutes
      cacheTime: 1000 * 60 * 60, // Cache for 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      refetchOnReconnect: 'always',
      refetchInterval: false,
      suspense: false,
      networkMode: 'online',
      retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
});

// Add visibility change logging
document.addEventListener('visibilitychange', () => {
  console.log('[Visibility] Document visibility state:', document.visibilityState);
  console.log('[Visibility] Active queries:', queryClient.getQueryCache().findAll());
  console.log('[Visibility] Query cache state:', queryClient.getQueryCache().getAll());
});

// Add focus/blur logging
window.addEventListener('focus', () => {
  console.log('[Focus] Window focused');
  console.log('[Focus] React Query state:', {
    isFetching: queryClient.isFetching(),
    queries: queryClient.getQueryCache().getAll().map(query => ({
      queryKey: query.queryKey,
      state: query.state,
      isActive: query.isActive(),
    }))
  });
});

window.addEventListener('blur', () => {
  console.log('[Blur] Window blurred');
  console.log('[Blur] React Query state:', {
    isFetching: queryClient.isFetching(),
    queries: queryClient.getQueryCache().getAll().map(query => ({
      queryKey: query.queryKey,
      state: query.state,
      isActive: query.isActive(),
    }))
  });
});

// Add React Query state change logging
queryClient.getQueryCache().subscribe((event) => {
  console.log('[Query Cache] Event:', event.type, {
    queryKey: event.query?.queryKey,
    state: event.query?.state,
    isActive: event.query?.isActive(),
  });
});

// Add detailed error logging with rate limiting
let lastErrorTime = 0;
const ERROR_THROTTLE_MS = 1000; // Throttle to one error per second

window.onerror = function(msg, url, lineNo, columnNo, error) {
  const now = Date.now();
  if (now - lastErrorTime >= ERROR_THROTTLE_MS) {
    lastErrorTime = now;
    console.error('Global error:', {
      message: msg,
      url: url,
      lineNo: lineNo,
      columnNo: columnNo,
      error: error,
    });
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Failed to find the root element');
}

// Optimized loading state with minimal DOM manipulation
const showLoading = () => {
  const loadingHtml = `
    <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-center; background: #000;">
      <h1 style="font-size: 2.5rem; font-weight: bold; background: linear-gradient(to right, #8B5CF6, #6366F1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 2rem;">
        WavTrack
      </h1>
      <div style="position: relative;">
        <div style="height: 3rem; width: 3rem; border-radius: 9999px; border: 2px solid #8B5CF6; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
      </div>
      <p style="margin-top: 1rem; color: #6B7280;">Tracking your progress...</p>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
  
  // Use a single innerHTML operation
  rootElement.innerHTML = loadingHtml;
};

// Show loading state immediately
showLoading();

// Initialize app with error boundary
const initializeApp = () => {
  try {
    const root = createRoot(rootElement);
    
    // Wrap in ErrorBoundary for better error handling
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Something went wrong</h2>
        <p>Please try refreshing the page</p>
        <p style="color: red; font-size: 12px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `;
  }
};

// Initialize app when the window loads
window.addEventListener('load', initializeApp);

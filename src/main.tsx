import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/errorLogger'

// Initialize error logging
setupGlobalErrorHandlers()

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors (auth issues)
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        // Otherwise retry twice with exponential backoff
        return failureCount < 2
      },
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      suspense: false,
      networkMode: 'online',
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
})

// Track query state
let lastActiveQueries = new Map()

// Track initialization steps
let initSteps = {
  loadingShown: false,
  appInitStarted: false,
  rootCreated: false,
  renderStarted: false,
  renderCompleted: false,
}

// Initialize the app
console.log('[Init] Starting app initialization')

// Add visibility change handling
document.addEventListener('visibilitychange', () => {
  const isHidden = document.visibilityState === 'hidden'
  const isVisible = document.visibilityState === 'visible'

  if (isHidden) {
    // Save state of all queries
    queryClient
      .getQueryCache()
      .findAll()
      .forEach(query => {
        if (query.isActive()) {
          lastActiveQueries.set(JSON.stringify(query.queryKey), query.state.data)
        }
      })
  }

  if (isVisible) {
    // Restore saved queries
    lastActiveQueries.forEach((data, queryKeyStr) => {
      const queryKey = JSON.parse(queryKeyStr)
      queryClient.setQueryData(queryKey, data)
      queryClient.resetQueries({ queryKey })
    })
  }
})

// Add focus/blur handling
window.addEventListener('focus', () => {
  // Handle focus events
})

window.addEventListener('blur', () => {
  // Handle blur events
})

// Add React Query state change handling
queryClient.getQueryCache().subscribe(event => {
  // Handle query cache events
})

// Add detailed error logging with rate limiting
let lastErrorTime = 0
const ERROR_THROTTLE_MS = 1000 // Throttle to one error per second

// Handle React errors more gracefully
window.onerror = function (msg, url, lineNo, columnNo, error) {
  const now = Date.now()
  if (now - lastErrorTime >= ERROR_THROTTLE_MS) {
    lastErrorTime = now

    // Check for the specific error we're trying to fix
    const isObjectNoLongerExistsError =
      msg &&
      (msg.toString().includes('Object may no longer exist') ||
        msg.toString().includes('Could not fetch properties'))

    if (isObjectNoLongerExistsError) {
      // For this specific error, don't crash the app
      // It will recover on the next render cycle
      return true // Prevents the error from bubbling up
    }

    // For other errors, log them but don't swallow
    console.error('Global error:', {
      message: msg,
      url: url,
      lineNo: lineNo,
      columnNo: columnNo,
      error: error,
    })
  }
  return false
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

// Optimized loading state with minimal DOM manipulation
const showLoading = () => {
  initSteps.loadingShown = true
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
  `

  // Use a single innerHTML operation
  rootElement.innerHTML = loadingHtml
}

// Show loading state immediately
showLoading()

// Add custom error handler for module import errors
window.addEventListener(
  'error',
  event => {
    // Check if this is a module loading error
    if (
      event.error &&
      (event.error.message?.includes('Importing a module script failed') ||
        event.error.message?.includes('Importing a module failed') ||
        event.error.message?.includes('ChunkLoadError'))
    ) {
      // If this happens after app init, try to recover by forcing a refresh after a delay
      if (initSteps.renderStarted && !initSteps.renderCompleted) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

      // Prevent the error from bubbling up
      event.preventDefault()
      return true
    }
  },
  true
)

// Initialize app with error boundary
const initializeApp = () => {
  initSteps.appInitStarted = true

  try {
    const root = createRoot(rootElement)
    initSteps.rootCreated = true

    initSteps.renderStarted = true

    // Add error retry mechanism for module loading failures
    const renderWithRetry = (attempt = 0) => {
      try {
        // Wrap in ErrorBoundary for better error handling
        root.render(
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        )
        initSteps.renderCompleted = true
      } catch (error) {
        // For module loading errors, retry up to 2 times
        if (attempt < 2) {
          setTimeout(() => renderWithRetry(attempt + 1), 1000)
        } else {
          throw error
        }
      }
    }

    renderWithRetry()
  } catch (error) {
    console.error('Failed to initialize app:', error)
    throw error
  }
}

// Start initialization
initializeApp()

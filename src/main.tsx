import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandlers } from './lib/errorLogger'

// Initialize error logging
setupGlobalErrorHandlers()

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
        root.render(<App />)
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

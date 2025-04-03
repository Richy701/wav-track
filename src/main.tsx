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
  return false // Let the error propagate
}

const showLoading = () => {
  if (!initSteps.loadingShown) {
    const loadingDiv = document.createElement('div')
    loadingDiv.id = 'loading-screen'
    loadingDiv.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading...</div>
      </div>
    `
    document.body.appendChild(loadingDiv)
    initSteps.loadingShown = true
  }
}

const initializeApp = () => {
  try {
    if (!initSteps.appInitStarted) {
      initSteps.appInitStarted = true
      console.log('[Init] App initialization started')

      const container = document.getElementById('root')
      if (!container) {
        throw new Error('Root element not found')
      }

      const root = createRoot(container)
      initSteps.rootCreated = true
      console.log('[Init] Root created')

      initSteps.renderStarted = true
      console.log('[Init] Starting render')

      root.render(<App />)

      initSteps.renderCompleted = true
      console.log('[Init] Render completed')

      // Remove loading screen after successful render
      const loadingScreen = document.getElementById('loading-screen')
      if (loadingScreen) {
        loadingScreen.remove()
      }
    }
  } catch (error) {
    console.error('[Init] Error during initialization:', error)
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="error-container">
          <div class="error-text">Failed to load application</div>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      `
    }
  }
}

// Show loading screen immediately
showLoading()

// Initialize the app with a small delay to ensure DOM is ready
setTimeout(initializeApp, 100)

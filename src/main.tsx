import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { errorLogger } from './lib/errorLogger'
import { injectSpeedInsights } from '@vercel/speed-insights'

// Initialize error logging
errorLogger.init()

// Initialize Speed Insights
injectSpeedInsights()

// Create loading screen
const loadingScreen = document.createElement('div')
loadingScreen.id = 'loading-screen'
loadingScreen.innerHTML = `
  <div class="fixed inset-0 flex items-center justify-center bg-background">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-muted-foreground">Loading application...</p>
    </div>
  </div>
`
document.body.appendChild(loadingScreen)

// Initialize app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

// Remove loading screen and render app
const removeLoadingScreen = () => {
  const screen = document.getElementById('loading-screen')
  if (screen) {
    screen.remove()
  }
}

root.render(<App />)

// Remove loading screen after a short delay
setTimeout(removeLoadingScreen, 500)

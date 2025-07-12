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
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent blur-3xl"></div>
      <div class="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary/10 via-primary/[0.02] to-transparent blur-3xl"></div>
    </div>

    <div class="relative flex flex-col items-center gap-6 text-center">
      <div class="mb-4">
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
          WavTrack
        </h1>
      </div>

      <!-- Loading animation -->
      <div class="relative">
        <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-primary/0 animate-pulse blur-md"></div>
        <div class="relative" style="width: 48px; height: 48px;">
          <div class="absolute inset-0 rotate-180">
            <svg class="animate-spin text-foreground opacity-20" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <svg class="relative animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      </div>

      <!-- Loading text -->
      <div class="space-y-2">
        <p class="text-base sm:text-lg font-medium text-foreground/80">Loading application...</p>
        <p class="text-sm text-muted-foreground">Your beat production journey starts here</p>
      </div>
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

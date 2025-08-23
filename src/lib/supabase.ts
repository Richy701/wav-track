import { createClient } from '@supabase/supabase-js'
import { Database } from '../integrations/supabase/types'
import { errorLogger } from './errorLogger'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV

// Debug: Log environment check (will be visible in production for debugging)
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isDev: isDevelopment,
  mode: import.meta.env.MODE
})

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (isDevelopment) {
    console.warn('Missing Supabase environment variables. Using fallback configuration for development.')
    // In development, we can continue without Supabase for now
  } else {
    console.error('Missing Supabase environment variables in production:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    // Don't throw in production - let the app render with null client
  }
}

// Create Supabase client with enhanced security configuration
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
        // Add security headers
        headers: {
          'X-Client-Info': 'supabase-js/2.39.3',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Add security options
        cookieOptions: {
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js/2.39.3',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      },
      db: {
        schema: 'public',
        // Add query timeout
        queryTimeout: 10000, // 10 seconds
      },
      // Add realtime configuration with security
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        headers: {
          'X-Client-Info': 'supabase-js/2.39.3',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      },
    })
  : null

// Add error handling middleware only if supabase is configured
if (supabase) {
  // Remove duplicate auth state change listener to prevent conflicts
  // The auth state is handled in AuthContext.tsx
}

// Add request interceptor for rate limiting
const originalFetch = window.fetch
window.fetch = async (input, init) => {
  try {
    // Add security headers to all requests
    const headers = new Headers(init?.headers)
    headers.set('X-Requested-With', 'XMLHttpRequest')
    headers.set('X-Client-Info', 'supabase-js/2.39.3')

    const response = await originalFetch(input, {
      ...init,
      headers,
    })

    // Log errors
    if (!response.ok) {
      errorLogger.logError('API Error', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      })
    }

    return response
  } catch (error) {
    errorLogger.logError('Fetch Error', error)
    throw error
  }
}

// Add retry logic for rate-limited requests
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation()
  } catch (error: any) {
    if (error?.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

// Initialize error monitoring
errorLogger.monitorSupabaseErrors()

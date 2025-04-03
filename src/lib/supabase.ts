import { createClient } from '@supabase/supabase-js'
import { Database } from '../integrations/supabase/types'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with enhanced configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.39.3',
    },
  },
  db: {
    schema: 'public'
  }
})

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
import { monitorSupabaseErrors } from './errorLogger'
monitorSupabaseErrors()

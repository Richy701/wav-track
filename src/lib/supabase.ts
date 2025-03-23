import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Get environment variables with fallbacks for testing/development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-for-dev-only'

// Log warning instead of throwing if env vars are missing
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Missing Supabase environment variables. Using fallback values for development. App will not work correctly in production!'
  )
}

// Create Supabase client with enhanced error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    debug: import.meta.env.DEV, // Only debug in development
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web/2.39.3',
    },
  },
  db: {
    schema: 'public',
  },
})

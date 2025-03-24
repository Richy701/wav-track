import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const appUrl = import.meta.env.VITE_APP_URL

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

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
    redirectTo: `${appUrl}/auth/callback`,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web/2.39.3',
      'x-application-name': import.meta.env.VITE_APP_NAME || 'wav-track',
    },
  },
  db: {
    schema: 'public',
  },
})

// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ewenoruuogtoqyaxelgm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZW5vcnV1b2d0b3F5YXhlbGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzcwODIsImV4cCI6MjA1NjcxMzA4Mn0.-isMcYtlGLmSegcgZnfiVhmzwmzLrtXCQuQk3x1X0j8";
const SITE_URL = "https://wavtrack.lovable.app";
const BASE_URL = "/wav-track";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage
  },
  global: {
    headers: {
      'x-application-name': 'wavtrack'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Add error handling for fetch failures
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    localStorage.clear();
    window.location.href = `${BASE_URL}/login`;
  }
});
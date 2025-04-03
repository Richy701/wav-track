import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {}

export const authService = {
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { user: user as AuthUser, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { user: null, error: error as Error }
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  // ... rest of existing code ...
}

import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  isGuest?: boolean
  guestCreatedAt?: string
}

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

  async signInAsGuest(): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      // Generate secure random values for guest credentials
      const guestId = crypto.randomUUID()
      const guestEmail = `guest_${guestId}@wavtrack.io`
      const guestPassword = crypto.randomUUID()

      // Create a new user with guest metadata
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            isGuest: true,
            guestCreatedAt: new Date().toISOString(),
          },
        },
      })

      if (signUpError) throw signUpError

      // Sign in with the guest credentials
      const {
        data: { user: signedInUser },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      })

      if (signInError) throw signInError

      return { user: signedInUser as AuthUser, error: null }
    } catch (error) {
      console.error('Error signing in as guest:', error)
      return { user: null, error: error as Error }
    }
  },

  async signOut(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.user_metadata?.isGuest) {
        // Delete guest data before signing out
        await this.deleteGuestData(user.id)
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  async deleteGuestData(userId: string): Promise<void> {
    try {
      // Delete all guest data using RPC function
      await supabase.rpc('delete_guest_data', { guest_user_id: userId })
    } catch (error) {
      console.error('Error deleting guest data:', error)
      throw error
    }
  },

  // ... rest of existing code ...
}

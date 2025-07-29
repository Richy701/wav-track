import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { toast } from '@/components/ui/use-toast'
import type { ToastProps } from '@/components/ui/toast'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate, useLocation } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'
import { Json, Database } from '@/integrations/supabase/types'
import { PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { WelcomeModal } from '@/components/WelcomeModal'

export interface Profile {
  id: string
  email: string
  name: string | null
  artist_name: string | null
  genres: string[] | null
  daw: string | null
  bio: string | null
  location: string | null
  phone: string | null
  website: string | null
  birthday: string | null
  timezone: string
  productivity_score: number
  total_beats: number
  completed_projects: number
  completion_rate: number
  current_streak: number
  best_streak: number
  join_date: string | null
  updated_at: string | null
  social_links: {
    instagram: string | null
    instagram_username: string | null
    twitter: string | null
    twitter_username: string | null
    youtube: string | null
    youtube_username: string | null
    soundcloud?: string
    spotify?: string
  }
  notification_preferences: {
    newFollowers: boolean
    beatComments: boolean
    collaborationRequests: boolean
  }
}

type DbProfile = Database['public']['Tables']['profiles']['Row']
type DbProfileUpdate = Database['public']['Tables']['profiles']['Update']
type ProfileUpdate = Omit<DbProfileUpdate, 'id'>
type DbProfileInsert = Database['public']['Tables']['profiles']['Insert']

interface RegisterData {
  name: string
  email: string
  password: string
  artist_name?: string
  genres?: string[]
  daw?: string
  bio?: string
  location?: string
  phone?: string
  website?: string
}

interface AuthStateRef {
  mounted: boolean
  initStarted: boolean
  initCompleted: boolean
  initError: Error | null
  initRetryCount: number
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  updateUserProfile: (userData: Partial<Profile>) => Promise<Profile>
  refreshProfile: () => Promise<void>
  showWelcomeModal: boolean
  setShowWelcomeModal: React.Dispatch<React.SetStateAction<boolean>>
}

interface ProfileUpdateData {
  name?: string | null
  email?: string
  artist_name?: string | null
  genres?: string[] | null
  daw?: string | null
  bio?: string | null
  location?: string | null
  phone?: string | null
  website?: string | null
  birthday?: string | null
  timezone?: string | null
  social_links?: Profile['social_links']
  notification_preferences?: Profile['notification_preferences']
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Create a wrapper component that handles navigation
const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const authStateRef = React.useRef<AuthStateRef>({
    mounted: true,
    initStarted: false,
    initCompleted: false,
    initError: null,
    initRetryCount: 0,
  })
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // Effect to handle auth state changes and invalidate queries
  useEffect(() => {
    console.log('[Debug] Setting up auth state change listener')
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Debug] Auth state changed:', { event, userId: session?.user?.id })
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Debug] Processing sign in')
        if (authStateRef.current.mounted) {
          setUser(session.user)
          
          // Only fetch profile if we don't have one or if it's a new user
          if (!profile) {
            console.log('[Debug] Fetching user profile')
            const profileData = await fetchProfile(session.user.id)
            
            if (authStateRef.current.mounted) {
              if (profileData) {
                console.log('[Debug] Setting existing profile')
                setProfile(profileData)
              } else {
                console.log('[Debug] Creating default profile')
                // Create default profile with Google data
                const defaultProfile = createDefaultProfile(
                  session.user.id,
                  session.user.email!,
                  session.user.user_metadata?.name || session.user.email?.split('@')[0] || null
                )
                const newProfile = await createProfile(defaultProfile)
                if (authStateRef.current.mounted) {
                  setProfile(newProfile)
                }
              }
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Debug] Processing sign out')
        if (authStateRef.current.mounted) {
          setUser(null)
          setProfile(null)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Initial auth check with improved error handling and loading states
  useEffect(() => {
    console.log('[Debug] Starting auth initialization')
    const initializeAuth = async () => {
      if (authStateRef.current.initStarted) {
        console.log('[Debug] Auth initialization already started')
        return
      }
      authStateRef.current.initStarted = true

      try {
        setIsLoading(true)
        
        // Check if Supabase is configured
        if (!supabase) {
          console.warn('[Debug] Supabase not configured. Skipping auth initialization.')
          if (authStateRef.current.mounted) {
            setIsLoading(false)
            setIsInitialized(true)
            authStateRef.current.initCompleted = true
          }
          return
        }

        console.log('[Debug] Checking current session')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[Debug] Session error:', error)
          throw error
        }

        if (session?.user) {
          console.log('[Debug] Found existing session')
          // Only refresh session if it's expired
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.refreshSession()
          
          if (sessionError) {
            console.error('[Debug] Session refresh error:', sessionError)
            throw sessionError
          }

          if (currentSession?.user) {
            console.log('[Debug] Session refreshed successfully')
            setUser(currentSession.user)
            // Only fetch profile if we don't have one
            if (!profile) {
              console.log('[Debug] Fetching initial profile')
              const profileData = await fetchProfile(currentSession.user.id)
              
              if (authStateRef.current.mounted) {
                if (profileData) {
                  console.log('[Debug] Setting initial profile')
                  setProfile(profileData)
                }
              }
            }
          }
        } else {
          console.log('[Debug] No existing session found')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        authStateRef.current.initError = error as Error
      } finally {
        if (authStateRef.current.mounted) {
          setIsLoading(false)
          setIsInitialized(true)
          authStateRef.current.initCompleted = true
        }
      }
    }

    initializeAuth()

    return () => {
      authStateRef.current.mounted = false
    }
  }, [profile])

  const showErrorToast = (title: string, description: string) => {
    toast({
      variant: 'destructive',
      title,
      description,
    })
  }

  const showSuccessToast = (title: string, description: string) => {
    toast({
      variant: 'default',
      title,
      description,
      className: 'bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20',
    })
  }

  const handleNewUser = async (user: User) => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot create profile.')
        return null
      }

      const defaultProfile = createDefaultProfile(
        user.id,
        user.email!,
        user.user_metadata.name || null
      )

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (insertError || !newProfile) {
        console.error('[Auth] Error creating profile:', insertError)
        throw insertError
      }

      return convertProfileFromDb(newProfile)
    } catch (error) {
      console.error('[Auth] Error in handleNewUser:', error)
      throw error
    }
  }

  const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot fetch profile.')
        return null
      }

      console.log('[Debug] Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Debug] Profile fetch error:', error)
        if (retryCount < 3) {
          console.log('[Debug] Retrying profile fetch, attempt:', retryCount + 1)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }
        return null
      }

      if (data) {
        console.log('[Debug] Profile data received:', data)
        return convertProfileFromDb(data)
      }

      return null
    } catch (error) {
      console.error('[Debug] Profile fetch exception:', error)
      return null
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot login.')
        showErrorToast('Login Error', 'Authentication service is not configured.')
        return false
      }

      console.log('[Debug] Attempting login for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[Debug] Login error:', error)
        showErrorToast('Login Failed', error.message)
        return false
      }

      if (data.user && data.session) {
        console.log('[Debug] Login successful')
        await handleLoginSuccess(data.session)
        return true
      }

      return false
    } catch (error) {
      console.error('[Debug] Login exception:', error)
      showErrorToast('Login Error', 'An unexpected error occurred during login.')
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot login with Google.')
        showErrorToast('Login Error', 'Authentication service is not configured.')
        return false
      }

      console.log('[Debug] Attempting Google login')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('[Debug] Google login error:', error)
        showErrorToast('Google Login Failed', error.message)
        return false
      }

      console.log('[Debug] Google login initiated')
      return true
    } catch (error) {
      console.error('[Debug] Google login exception:', error)
      showErrorToast('Google Login Error', 'An unexpected error occurred during Google login.')
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot register.')
        showErrorToast('Registration Error', 'Authentication service is not configured.')
        return false
      }

      console.log('[Debug] Attempting registration for:', data.email)
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            artist_name: data.artist_name,
            genres: data.genres,
            daw: data.daw,
            bio: data.bio,
            location: data.location,
            phone: data.phone,
            website: data.website,
          },
        },
      })

      if (error) {
        console.error('[Debug] Registration error:', error)
        showErrorToast('Registration Failed', error.message)
        return false
      }

      if (authData.user) {
        console.log('[Debug] Registration successful')
        showSuccessToast('Registration Successful', 'Please check your email to verify your account.')
        return true
      }

      return false
    } catch (error) {
      console.error('[Debug] Registration exception:', error)
      showErrorToast('Registration Error', 'An unexpected error occurred during registration.')
      return false
    }
  }

  const logout = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot logout.')
        return
      }

      console.log('[Debug] Attempting logout')
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[Debug] Logout error:', error)
        showErrorToast('Logout Error', error.message)
        return
      }

      console.log('[Debug] Logout successful')
      setUser(null)
      setProfile(null)
      showSuccessToast('Logged Out', 'You have been successfully logged out.')
    } catch (error) {
      console.error('[Debug] Logout exception:', error)
      showErrorToast('Logout Error', 'An unexpected error occurred during logout.')
    }
  }

  const updateUserProfile = async (userData: ProfileUpdateData): Promise<Profile> => {
    try {
      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('[Debug] Updating profile for user:', user.id)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          artist_name: userData.artist_name,
          genres: userData.genres ? convertGenresToDb(userData.genres) : undefined,
          daw: userData.daw,
          bio: userData.bio,
          location: userData.location,
          phone: userData.phone,
          website: userData.website,
          birthday: userData.birthday,
          timezone: userData.timezone,
          social_links: userData.social_links,
          notification_preferences: userData.notification_preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('[Debug] Profile update error:', error)
        throw error
      }

      if (!data) {
        throw new Error('Profile not found')
      }

      const updatedProfile = convertProfileFromDb(data)
      setProfile(updatedProfile)
      showSuccessToast('Profile Updated', 'Your profile has been updated successfully.')
      return updatedProfile
    } catch (error) {
      console.error('[Debug] Profile update exception:', error)
      showErrorToast('Profile Update Failed', 'Failed to update profile. Please try again.')
      throw error
    }
  }

  const refreshProfile = async () => {
    try {
      if (!user) {
        console.log('[Debug] No user to refresh profile for')
        return
      }

      console.log('[Debug] Refreshing profile')
      const profileData = await fetchProfile(user.id)
      
      if (authStateRef.current.mounted) {
        if (profileData) {
          console.log('[Debug] Profile refreshed successfully')
          setProfile(profileData)
        } else {
          console.log('[Debug] No profile data received during refresh')
        }
      }
    } catch (error) {
      console.error('[Debug] Profile refresh error:', error)
    }
  }

  const handleLoginSuccess = async (session: Session) => {
    try {
      // Ensure we have a valid user
      if (!session?.user) {
        console.error('[Auth] Login success handler received invalid session', session)
        return
      }

      // Set the user state first
      setUser(session.user)

      // Ensure profile data is loaded to prevent state issues
      try {
        const profileData = await fetchProfile(session.user.id)
        if (profileData && authStateRef.current.mounted) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('[Auth] Error fetching profile during login:', error)
      }

      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries(['profile'])
      queryClient.invalidateQueries(['projects'])

      // Navigate after state updates
      if (authStateRef.current.mounted) {
        // Get the redirect location from state, default to dashboard
        const from = location.state?.from || '/dashboard'
        
        // Navigate to the intended destination
        navigate(from, { replace: true })

        // Show welcome modal and success toast after a short delay to ensure navigation is complete
        setTimeout(() => {
          if (authStateRef.current.mounted) {
            // Show welcome modal
            setShowWelcomeModal(true)

            // Show success toast
            toast({
              title: '🎹 Back in the Mix!',
              description: (
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Ready to create something amazing?</p>
                  <p className="text-sm text-muted-foreground">
                    Last session:{' '}
                    {formatDistanceToNow(
                      new Date(session.user.last_sign_in_at || Date.now())
                    )}{' '}
                    ago
                  </p>
                  <div className="mt-1 text-xs flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary/50 animate-pulse" />
                    <span>Your beats are waiting</span>
                  </div>
                </div>
              ),
              variant: 'default',
              className:
                'bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20',
            })
          }
        }, 100)
      }
    } catch (error) {
      console.error('[Auth] Error in handleLoginSuccess:', error)
      if (session?.user) {
        setUser(session.user)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUserProfile,
        refreshProfile,
        showWelcomeModal,
        setShowWelcomeModal,
      }}
    >
      {children}
      <WelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
    </AuthContext.Provider>
  )
}

// Create a separate AuthNavigationProvider component
export const AuthNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized) {
      const publicPaths = ['/login', '/auth/callback', '/']
      const isPublicPath = publicPaths.includes(location.pathname)

      if (!user && !isPublicPath) {
        navigate('/login')
      } else if (user && isPublicPath && location.pathname !== '/') {
        navigate('/dashboard')
      }
    }
  }, [user, isInitialized, location.pathname, navigate])

  return <>{children}</>
}

// Update AuthProvider to not include navigation logic
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create the auth context value with default values
  const authContextValue: AuthContextType = {
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    login: async () => false,
    loginWithGoogle: async () => false,
    register: async () => false,
    logout: async () => {},
    updateUserProfile: async () => ({ id: '', email: '', name: null, artist_name: null, genres: null, daw: null, bio: null, location: null, phone: null, website: null, birthday: null, timezone: '', productivity_score: 0, total_beats: 0, completed_projects: 0, completion_rate: 0, current_streak: 0, best_streak: 0, join_date: null, updated_at: null, social_links: { instagram: null, instagram_username: null, twitter: null, twitter_username: null, youtube: null, youtube_username: null }, notification_preferences: { newFollowers: true, beatComments: true, collaborationRequests: true } }),
    refreshProfile: async () => {},
    showWelcomeModal: false,
    setShowWelcomeModal: () => {},
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <AuthProviderWrapper>
        {children}
      </AuthProviderWrapper>
    </AuthContext.Provider>
  )
}

// Helper function to convert form genres to DB format
const convertGenresToDb = (genres: string[] | undefined): string | null => {
  return genres ? JSON.stringify(genres) : null
}

// Helper function to convert DB genres to form format
const convertGenresFromDb = (genres: string | null): string[] => {
  if (!genres) return []
  try {
    const parsed = JSON.parse(genres)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const createDefaultProfile = (userId: string, email: string, name: string | null): Database['public']['Tables']['profiles']['Insert'] => ({
  id: userId,
  email: email,
  name: name,
  artist_name: null,
  genres: [],
  daw: null,
  bio: null,
  location: null,
  phone: null,
  website: null,
  birthday: null,
  timezone: 'UTC',
  productivity_score: 0,
  total_beats: 0,
  completed_projects: 0,
  completion_rate: 0,
  current_streak: 0,
  best_streak: 0,
  join_date: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  social_links: {
    instagram: null,
    instagram_username: null,
    twitter: null,
    twitter_username: null,
    youtube: null,
    youtube_username: null,
  },
  notification_preferences: {
    newFollowers: true,
    beatComments: true,
    collaborationRequests: true,
  },
})

const convertProfileFromDb = (data: Database['public']['Tables']['profiles']['Row']): Profile => {
  // Type guard to check if social_links is valid
  const isValidSocialLinks = (links: any): links is Profile['social_links'] => {
    if (!links || typeof links !== 'object') return false
    return (
      'instagram' in links &&
      'instagram_username' in links &&
      'twitter' in links &&
      'twitter_username' in links &&
      'youtube' in links &&
      'youtube_username' in links
    )
  }

  // Type guard to check if notification_preferences is valid
  const isValidNotificationPreferences = (prefs: any): prefs is Profile['notification_preferences'] => {
    if (!prefs || typeof prefs !== 'object') return false
    return (
      'newFollowers' in prefs &&
      'beatComments' in prefs &&
      'collaborationRequests' in prefs &&
      typeof prefs.newFollowers === 'boolean' &&
      typeof prefs.beatComments === 'boolean' &&
      typeof prefs.collaborationRequests === 'boolean'
    )
  }

  // Default social links object
  const defaultSocialLinks: Profile['social_links'] = {
    instagram: null,
    instagram_username: null,
    twitter: null,
    twitter_username: null,
    youtube: null,
    youtube_username: null,
  }

  // Default notification preferences
  const defaultNotificationPreferences: Profile['notification_preferences'] = {
    newFollowers: true,
    beatComments: true,
    collaborationRequests: true,
  }

  // Parse and validate social links
  let socialLinks: Profile['social_links']
  try {
    const parsedLinks = typeof data.social_links === 'string' 
      ? JSON.parse(data.social_links) 
      : data.social_links

    if (isValidSocialLinks(parsedLinks)) {
      socialLinks = {
        instagram: parsedLinks.instagram || null,
        instagram_username: parsedLinks.instagram_username || null,
        twitter: parsedLinks.twitter || null,
        twitter_username: parsedLinks.twitter_username || null,
        youtube: parsedLinks.youtube || null,
        youtube_username: parsedLinks.youtube_username || null,
      }
    } else {
      socialLinks = defaultSocialLinks
    }
  } catch (error) {
    console.error('Error parsing social links:', error)
    socialLinks = defaultSocialLinks
  }

  // Parse and validate notification preferences
  let notificationPreferences: Profile['notification_preferences']
  try {
    const parsedPrefs = typeof data.notification_preferences === 'string'
      ? JSON.parse(data.notification_preferences)
      : data.notification_preferences

    notificationPreferences = isValidNotificationPreferences(parsedPrefs)
      ? parsedPrefs
      : defaultNotificationPreferences
  } catch (error) {
    console.error('Error parsing notification preferences:', error)
    notificationPreferences = defaultNotificationPreferences
  }

  // Parse and validate genres
  let genres: string[] = []
  try {
    if (data.genres) {
      if (typeof data.genres === 'string') {
        genres = JSON.parse(data.genres)
      } else if (Array.isArray(data.genres)) {
        genres = data.genres
      }
      // Ensure genres is an array
      genres = Array.isArray(genres) ? genres : []
    }
  } catch (error) {
    console.error('Error parsing genres:', error)
    genres = []
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    artist_name: data.artist_name,
    genres: genres,
    daw: data.daw,
    bio: data.bio,
    location: data.location,
    phone: data.phone,
    website: data.website,
    birthday: data.birthday,
    timezone: data.timezone,
    productivity_score: data.productivity_score,
    total_beats: data.total_beats,
    completed_projects: data.completed_projects,
    completion_rate: data.completion_rate,
    current_streak: data.current_streak,
    best_streak: data.best_streak,
    join_date: data.join_date,
    updated_at: data.updated_at,
    social_links: socialLinks,
    notification_preferences: notificationPreferences,
  }
}

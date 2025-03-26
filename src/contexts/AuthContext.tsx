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
  const navigate = useNavigate()
  const location = useLocation()
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

  // Effect to handle initial navigation
  useEffect(() => {
    console.log('[Debug] Auth navigation effect - Current state:', {
      user: !!user,
      isLoading,
      isInitialized,
      pathname: location.pathname
    })
    
    if (!user && !isLoading && isInitialized && location.pathname !== '/login' && location.pathname !== '/auth/callback') {
      console.log('[Debug] Redirecting to login')
      navigate('/login', { replace: true })
    }
  }, [user, isLoading, isInitialized, location.pathname, navigate])

  // Function to show welcome modal with delay
  const showWelcomeModalWithDelay = React.useCallback(() => {
    console.log('[Debug] Checking welcome modal display conditions')
    // Only show on the home page
    if (location.pathname === '/') {
      setTimeout(() => {
        if (authStateRef.current.mounted) {
          console.log('[Debug] Showing welcome modal')
          setShowWelcomeModal(true)
        }
      }, 500) // 500ms delay
    }
  }, [location.pathname])

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

                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert([defaultProfile])
                  .select()
                  .single()

                if (!createError && newProfile) {
                  console.log('[Debug] Setting new profile')
                  setProfile(convertProfileFromDb(newProfile))
                } else {
                  console.error('[Debug] Error creating profile:', createError)
                  toast({
                    variant: 'destructive',
                    title: 'Profile Error',
                    description: 'Failed to create profile. Please try again.',
                  })
                }
              }
            }
          }

          // Only invalidate queries if this is a new sign in
          if (!isInitialized) {
            console.log('[Debug] Invalidating queries after sign in')
            queryClient.invalidateQueries(['profile'])
            queryClient.invalidateQueries(['projects'])
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Debug] Processing sign out')
        if (authStateRef.current.mounted) {
          setUser(null)
          setProfile(null)
          // Clear queries when user signs out
          queryClient.clear()
        }
      }
    })

    return () => {
      console.log('[Debug] Cleaning up auth state change listener')
      subscription.unsubscribe()
    }
  }, [queryClient, profile, isInitialized])

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

  const handleNewUser = async (session: Session) => {
    if (!session.user) return null
    
    const defaultProfile = createDefaultProfile(
      session.user.id,
      session.user.email!,
      session.user.user_metadata?.name || session.user.email?.split('@')[0] || null
    )

    try {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (createError) {
        console.error('[Debug] Error creating profile:', createError)
        toast({
          variant: 'destructive',
          title: 'Profile Error',
          description: 'Failed to create profile. Please try again.',
        })
        return null
      }

      if (!newProfile) {
        console.error('[Debug] No profile created')
        return null
      }

      return convertProfileFromDb(newProfile)
    } catch (error) {
      console.error('[Debug] Error in handleNewUser:', error)
      return null
    }
  }

  const fetchProfile = async (userId: string, retryCount = 0): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single()

      if (error) {
        // If we get a 403/404 and haven't retried too many times, wait briefly and retry
        if ((error.code === '403' || error.code === '404') && retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return fetchProfile(userId, retryCount + 1)
        }

        console.error('Profile fetch error:', error)
        toast({
          variant: 'destructive',
          title: 'Profile Error',
          description: 'Failed to fetch profile data. Please try again.',
        })
        throw error
      }

      if (!data) {
        console.error('[Debug] No profile found')
        return null
      }

      return convertProfileFromDb(data)
    } catch (error) {
      console.error('Profile fetch error:', error)
      toast({
        variant: 'destructive',
        title: 'Profile Error',
        description: 'Failed to fetch profile data. Please try again.',
      })
      return null
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || 'An error occurred during login',
        })
        return false
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id)
        const userName = profileData?.name || data.user.email?.split('@')[0] || 'there'

        handleLoginSuccess(data.session)
        return true
      }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'No user data received',
      })
      return false
    } catch (error) {
      console.error('Login error:', error)
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    console.log('[Auth] Registration attempt blocked - direct registration is disabled')
    toast({
      variant: 'destructive',
      title: 'Registration Disabled',
      description: 'New user registration is currently by invitation only. Please use Google authentication or contact the administrator.'
    })
    return false
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)

      showSuccessToast('Logged out successfully', 'You have been logged out successfully')

      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      showErrorToast('Logout Failed', 'An error occurred while logging out')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserProfile = async (userData: ProfileUpdateData): Promise<Profile> => {
    if (!user || !profile) {
      throw new Error('No user or profile found')
    }

    try {
      const updateData = {
        name: userData.name ?? profile.name,
        email: userData.email ?? profile.email,
        artist_name: userData.artist_name ?? profile.artist_name,
        genres: userData.genres ? JSON.stringify(userData.genres) : null,
        daw: userData.daw ?? profile.daw,
        bio: userData.bio ?? profile.bio,
        location: userData.location ?? profile.location,
        phone: userData.phone ?? profile.phone,
        website: userData.website ?? profile.website,
        birthday: userData.birthday ?? profile.birthday,
        timezone: userData.timezone ?? profile.timezone,
        social_links: userData.social_links ?? profile.social_links,
        notification_preferences:
          userData.notification_preferences ?? profile.notification_preferences,
        updated_at: new Date().toISOString(),
      } as DbProfileUpdate

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('[Auth] Profile update error:', error)
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message,
        })
        throw error
      }

      if (!data) {
        const msg = 'No data returned from update'
        console.error('[Auth] Profile update error:', msg)
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: msg,
        })
        throw new Error(msg)
      }

      const updatedProfile = convertProfileFromDb(data as DbProfile)
      setProfile(updatedProfile)

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
      })

      return updatedProfile
    } catch (error) {
      console.error('[Auth] Profile update error:', error)
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
      })
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    try {
      console.log('Refreshing profile for user:', user.id)
      const profileData = await fetchProfile(user.id)

      if (profileData) {
        setProfile(profileData)
        console.log('Profile refreshed successfully:', profileData)
      } else {
        console.error('No profile data found during refresh')
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
      showErrorToast('Refresh Failed', 'Failed to refresh profile')
      throw error
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
        // Navigate first
        navigate('/', { replace: true })

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

// Export the wrapper as the AuthProvider
export const AuthProvider = AuthProviderWrapper

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

    socialLinks = isValidSocialLinks(parsedLinks) 
      ? parsedLinks 
      : defaultSocialLinks
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

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    artist_name: data.artist_name,
    genres: data.genres || [],
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
    join_date: data.join_date,
    updated_at: data.updated_at,
    social_links: socialLinks,
    notification_preferences: notificationPreferences,
  }
}

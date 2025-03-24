import React, { createContext, useContext, useState, useEffect } from 'react'
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
  avatar_url: string | null
  artist_name: string | null
  genres: string[]
  daw: string | null
  bio: string | null
  location: string | null
  phone: string | null
  website: string | null
  birthday: string | null
  timezone: string | null
  productivity_score: number | null
  beats_created: number | null
  completed_projects: number | null
  completion_rate: number | null
  total_beats: number | null
  join_date: string | null
  updated_at: string | null
  social_links: {
    instagram: string | null
    instagram_username: string | null
    twitter: string | null
    twitter_username: string | null
    youtube: string | null
    youtube_username: string | null
  } | null
  notification_preferences: {
    newFollowers: boolean
    beatComments: boolean
    collaborationRequests: boolean
  } | null
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const authStateRef = React.useRef<AuthStateRef>({
    mounted: true,
    initStarted: false,
    initCompleted: false,
    initError: null,
    initRetryCount: 0,
  })

  // Function to show welcome modal with delay
  const showWelcomeModalWithDelay = React.useCallback(() => {
    // Only show on the home page
    if (location.pathname === '/') {
      setTimeout(() => {
        if (authStateRef.current.mounted) {
          setShowWelcomeModal(true)
        }
      }, 500) // 500ms delay
    }
  }, [location.pathname])

  // Effect to handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        if (authStateRef.current.mounted) {
          setUser(session.user)
        }
      } else if (event === 'SIGNED_OUT') {
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

  // Initial auth check
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          
          if (authStateRef.current.mounted) {
            if (profileData) {
              setProfile(profileData)
            } else {
              // Create default profile if none exists
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
                setProfile(convertProfileFromDb(newProfile))
              }
            }
          }
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (authStateRef.current.mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      authStateRef.current.mounted = false
    }
  }, [])

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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Profile Error',
        description: 'Failed to fetch profile data. Please try again.',
      })
      throw error
    }

    return data ? convertProfileFromDb(data) : null
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

  const register = async (registerData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: error.message || 'An error occurred during registration',
        })
        return false
      }

      if (data.user) {
        const defaultProfile = createDefaultProfile(
          data.user.id,
          registerData.email,
          registerData.name
        )

        // Add registration-specific fields
        const profileData: DbProfileInsert = {
          ...defaultProfile,
          artist_name: registerData.artist_name || null,
          genres: registerData.genres ? JSON.stringify(registerData.genres) : null,
          daw: registerData.daw || null,
          bio: registerData.bio || null,
          location: registerData.location || null,
          phone: registerData.phone || null,
          website: registerData.website || null,
        }

        const { error: profileError } = await supabase.from('profiles').insert([profileData])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          toast({
            variant: 'destructive',
            title: 'Account Created',
            description:
              'Your account was created but some profile information could not be saved. You can update it after logging in.',
          })
          return true
        }

        toast({
          title: 'Registration Successful',
          description: 'Welcome to the community! Please check your email to verify your account.',
          className:
            'bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20',
        })
        return true
      }

      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'No user data received',
      })
      return false
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
      return false
    } finally {
      setIsLoading(false)
    }
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
      const updateData: DbProfileUpdate = {
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
      }

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

      const updatedProfile = convertProfileFromDb(data)
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

      // Add a longer delay to ensure all state updates have propagated
      // through React's state update queue
      await new Promise(resolve => setTimeout(resolve, 500))

      // Use a separate effect to handle navigation after state update
      // This prevents the "Object may no longer exist" error by ensuring
      // the state is fully processed before navigation
      setTimeout(() => {
        // Only navigate when we're sure the component is still mounted
        if (authStateRef.current.mounted) {
          // Safely navigate with a longer delay
          console.log('[Auth] Navigating to home after login')

          // Update react-query cache to ensure data is available
          queryClient.invalidateQueries(['profile'])
          queryClient.invalidateQueries(['projects'])

          // Delay navigation to allow React Query cache updates to complete
          setTimeout(() => {
            if (authStateRef.current.mounted) {
              navigate('/', { replace: true })

              // Show welcome modal and success toast after navigation
              setTimeout(() => {
                if (authStateRef.current.mounted) {
                  // Show welcome modal only on the home page
                  if (location.pathname === '/') {
                    setShowWelcomeModal(true)
                  }

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
          }, 100)
        }
      }, 300)
    } catch (error) {
      console.error('[Auth] Error in handleLoginSuccess:', error)
      // Still set the user even if there's an error with the navigation or toast
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

const convertProfileFromDb = (data: DbProfile): Profile => {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar_url: data.avatar_url,
    artist_name: data.artist_name,
    genres: convertGenresFromDb(data.genres),
    daw: data.daw,
    bio: data.bio,
    location: data.location,
    phone: data.phone,
    website: data.website,
    birthday: data.birthday,
    timezone: data.timezone,
    productivity_score: data.productivity_score,
    beats_created: data.beats_created,
    completed_projects: data.completed_projects,
    completion_rate: data.completion_rate,
    total_beats: data.total_beats,
    join_date: data.join_date,
    updated_at: data.updated_at,
    social_links: data.social_links as Profile['social_links'],
    notification_preferences:
      (data.notification_preferences as Profile['notification_preferences']) ?? {
        newFollowers: true,
        beatComments: true,
        collaborationRequests: true,
      },
  }
}

const createDefaultProfile = (userId: string, email: string, name: string | null): Profile => ({
  id: userId,
  email: email,
  name: name,
  avatar_url: null,
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
  beats_created: 0,
  completed_projects: 0,
  completion_rate: 0,
  total_beats: 0,
  join_date: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  social_links: null,
  notification_preferences: {
    newFollowers: true,
    beatComments: true,
    collaborationRequests: true,
  },
})

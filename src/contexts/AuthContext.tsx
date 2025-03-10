import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { ToastProps } from '@/components/ui/toast';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar_url?: string;
  artist_name?: string;
  genres?: string[];
  daw?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  birthday?: string;
  timezone?: string;
  productivityScore: number;
  totalBeats: number;
  completedProjects: number;
  completionRate: number;
  followers: number;
  following: number;
  collaborations: number;
  projects?: Project[];
  social?: {
    instagram?: string;
    instagram_username?: string;
    twitter?: string;
    twitter_username?: string;
    youtube?: string;
    youtube_username?: string;
  };
  notifications?: {
    newFollowers: boolean;
    beatComments: boolean;
    collaborationRequests: boolean;
  };
}

interface DatabaseProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  artist_name?: string;
  genres?: string;
  daw?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  birthday?: string;
  timezone?: string;
  productivity_score?: number;
  total_beats?: number;
  completed_projects?: number;
  completion_rate?: number;
  follower_count?: number;
  following_count?: number;
  collaboration_count?: number;
  social_links?: Record<string, string>;
  notification_preferences?: {
    newFollowers: boolean;
    beatComments: boolean;
    collaborationRequests: boolean;
  };
  updated_at?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  artist_name?: string;
  genres?: string;
  daw?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<Profile>) => Promise<Profile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const showErrorToast = (title: string, description: string) => {
    toast({
      variant: "destructive",
      title,
      description,
    });
  };

  const showSuccessToast = (title: string, description: string) => {
    toast({
      variant: "default",
      title,
      description,
      className: "bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20",
    });
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name
      `)
      .eq('id', userId)
      .single();

    if (error) {
      showErrorToast(
        'Profile Error',
        'Failed to fetch profile data. Please try again.'
      );
      throw error;
    }
    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar_url: null,
      artist_name: '',
      genres: [],
      daw: '',
      bio: '',
      location: '',
      phone: '',
      website: '',
      birthday: '',
      timezone: 'UTC',
      productivityScore: 0,
      totalBeats: 0,
      completedProjects: 0,
      completionRate: 0,
      social: {},
      notifications: {
        newFollowers: true,
        beatComments: true,
        collaborationRequests: true
      },
      followers: 0,
      following: 0,
      collaborations: 0
    };
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        console.log('[Auth] Starting initialization...');
        setIsLoading(true);
        setIsInitialized(false); // Reset initialization state
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('[Auth] Session check:', session ? 'Found session' : 'No session', error ? `Error: ${error.message}` : '');
        
        if (error) {
          console.error('[Auth] Session error:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setIsInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        if (!session?.user) {
          console.log('[Auth] No user in session');
          if (mounted) {
            setUser(null);
            setProfile(null);
            setIsInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        console.log('[Auth] Setting user:', session.user.id);
        if (mounted) {
          setUser(session.user);
        }

        console.log('[Auth] Fetching profile...');
        try {
          const profileData = await fetchProfile(session.user.id);
          console.log('[Auth] Profile fetch result:', profileData ? 'Success' : 'Not found');
          
          if (!mounted) return;

          if (profileData) {
            setProfile(profileData);
          } else {
            console.log('[Auth] Creating default profile...');
            const defaultProfile: Profile = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              productivityScore: 0,
              totalBeats: 0,
              completedProjects: 0,
              completionRate: 0,
              followers: 0,
              following: 0,
              collaborations: 0
            };
            setProfile(defaultProfile);
            
            const { error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                name: defaultProfile.name,
              }]);
              
            if (createError) {
              console.error('[Auth] Error creating profile:', createError);
            }
          }
        } catch (error) {
          console.error('[Auth] Profile fetch error:', error);
          if (mounted) {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('[Auth] Completing initialization...');
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('[Auth] Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        setIsLoading(true);
        
        try {
          const profileData = await fetchProfile(session.user.id);
          if (!mounted) return;
          
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('[Auth] Profile fetch error on auth change:', error);
          if (mounted) {
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      } else {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    console.log('Waiting for auth initialization...');
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent blur-3xl" />
          <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary/10 via-primary/[0.02] to-transparent blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="mb-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
              WavTrack
            </h1>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-primary/0 animate-pulse blur-md" />
            <div className="relative h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>

          <div className="space-y-2">
            <p className="text-base sm:text-lg font-medium text-foreground/80">
              Tracking your progress...
            </p>
            <p className="text-sm text-muted-foreground">
              Your beat production journey starts here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showErrorToast(
          'Login Failed',
          error.message || 'An error occurred during login'
        );
        return false;
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        const userName = profileData?.name || data.user.email?.split('@')[0] || 'there';
        
        handleLoginSuccess(data.session);
        return true;
      }
      
      toast.error('Login failed', {
        description: 'No user data received'
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      showErrorToast(
        'Login Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name
          },
          emailRedirectTo: 'https://wavtrack.lovable.app/auth/callback'
        }
      });

      if (error) {
        showErrorToast(
          'Registration Failed',
          error.message || 'An error occurred during registration'
        );
        return false;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: registerData.name,
            email: registerData.email,
            artist_name: registerData.artist_name || null,
            genres: registerData.genres || null,
            daw: registerData.daw || null,
            bio: registerData.bio || null,
            location: registerData.location || null,
            phone: registerData.phone || null,
            website: registerData.website || null,
            join_date: new Date().toISOString(),
            timezone: 'UTC'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          showErrorToast(
            'Account Created',
            'Your account was created but some profile information could not be saved. You can update it after logging in.'
          );
          return true;
        }

        showSuccessToast(
          'Registration Successful',
          'Welcome to the community! Please check your email to verify your account.'
        );
        return true;
      }
      
      showErrorToast(
        'Registration Failed',
        'No user data received'
      );
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      showErrorToast(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      
      showSuccessToast(
        'Logged out successfully',
        'You have been logged out successfully'
      );
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      showErrorToast(
        'Logout Failed',
        'An error occurred while logging out'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<Profile>): Promise<Profile> => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    try {
      console.log('[Auth] Starting profile update with data:', userData);
      
      const updateData: { name?: string; email?: string } = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        showErrorToast(
          'Update Failed',
          'Failed to update profile'
        );
        throw error;
      }
      if (!data) throw new Error('No data returned from update');

      const updatedProfile: Profile = {
        ...profile,
        ...userData,
        id: data.id,
        email: data.email,
        name: data.name,
        avatar_url: profile.avatar_url,
        artist_name: userData.artist_name || profile.artist_name,
        genres: userData.genres || profile.genres,
        daw: userData.daw || profile.daw,
        bio: userData.bio || profile.bio,
        location: userData.location || profile.location,
        phone: userData.phone || profile.phone,
        website: userData.website || profile.website,
        birthday: userData.birthday || profile.birthday,
        timezone: userData.timezone || profile.timezone,
        social: userData.social || profile.social,
        notifications: userData.notifications || profile.notifications
      };

      setProfile(updatedProfile);
      showSuccessToast(
        'Profile Updated',
        'Your profile has been successfully updated'
      );

      return updatedProfile;
    } catch (error) {
      console.error('[Auth] Profile update error:', error);
      showErrorToast(
        'Update Failed',
        'Failed to update profile'
      );
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing profile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      
      if (profileData) {
        setProfile(profileData);
        console.log('Profile refreshed successfully:', profileData);
      } else {
        console.error('No profile data found during refresh');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      showErrorToast(
        'Refresh Failed',
        'Failed to refresh profile'
      );
      throw error;
    }
  };

  const handleLoginSuccess = (session: Session) => {
    setUser(session.user);
    navigate('/');
    toast({
      title: '🎹 Back in the Mix!',
      description: (
        <div className="flex flex-col gap-1">
          <p className="font-medium">Ready to create something amazing?</p>
          <p className="text-sm text-muted-foreground">
            Last session: {formatDistanceToNow(new Date(session.user.last_sign_in_at))} ago
          </p>
          <div className="mt-1 text-xs flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/50 animate-pulse" />
            <span>Your beats are waiting</span>
          </div>
        </div>
      ),
      variant: "default",
      className: "bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAuthenticated: !!user, 
      isLoading,
      login,
      register,
      logout,
      updateUserProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

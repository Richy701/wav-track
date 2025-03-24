import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Gear,
  ArrowLeft as PhArrowLeft,
  MapPin as PhMapPin,
  Camera as PhCamera,
  SignOut,
  Clock,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AboutMe } from '@/components/profile/AboutMe'
import { StatsSummary } from '@/components/profile/StatsSummary'
import { RecentProjects } from '@/components/profile/RecentProjects'
import { Spinner } from '@/components/ui/spinner'
import { useImageCache } from '@/hooks/useImageCache'

const Profile = () => {
  const { profile, logout, refreshProfile, isLoading: authLoading, isInitialized } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const { cachedImage, isLoading: imageLoading, error: imageError } = useImageCache(profile?.avatar_url)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  // Refresh profile when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (!isInitialized || authLoading) return
      
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      // Set a new timeout to debounce the refresh
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await refreshProfile()
        } catch (error) {
          console.error('Error refreshing profile:', error)
          toast.error('Failed to load profile data')
        }
      }, 500) // 500ms debounce
    }

    loadProfile()
  }, [refreshProfile, isInitialized, authLoading])

  // Calculate the initials for the avatar fallback
  const getInitials = useCallback(() => {
    if (!profile?.name) return 'U'
    return profile.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }, [profile?.name])

  // Memoize handlers
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }

      try {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('avatar', file)
        await refreshProfile()
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to upload image')
      } finally {
        setIsLoading(false)
      }
    },
    [refreshProfile]
  )

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to logout')
    }
  }, [logout, navigate])

  // Show loading state while auth is initializing
  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Spinner className="h-8 w-8 mb-4" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="min-h-screen bg-background/50 pt-20">
        {/* Back Navigation */}
        <div className="fixed top-24 left-4 z-[100]">
          <Button
            variant="ghost"
            size="icon"
            className="group relative overflow-hidden bg-black/80 hover:bg-black/60 text-white rounded-full w-8 h-8 p-0 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-black/25"
            onClick={() => navigate('/')}
          >
            <PhArrowLeft className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-[-2px]" />
            <span className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>

        {/* Profile Header */}
        <div className="border-b border-muted">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar with Upload Button */}
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-muted shadow-sm">
                  {imageLoading && !imageError && (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <Spinner className="h-6 w-6" />
                    </div>
                  )}
                  {!imageLoading && !imageError && cachedImage && (
                    <AvatarImage 
                      src={cachedImage}
                      alt={profile?.name || 'Profile picture'}
                    />
                  )}
                  {(imageError || !cachedImage) && (
                    <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Upload profile picture"
                  title="Upload profile picture"
                >
                  <PhCamera className="h-5 w-5 text-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Profile picture upload"
                  title="Choose a profile picture"
                />
              </div>

              {/* Profile Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold truncate">
                        {profile?.name || 'Producer Name'}
                      </h1>
                      <span className="text-muted-foreground">
                        @{profile?.artist_name || 'artist'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <PhMapPin className="h-3 w-3" />
                        {profile?.location || 'Location'}
                      </span>
                      <span>•</span>
                      <span>Member since {new Date().getFullYear()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => navigate('/profile/settings')}
                    >
                      <Gear className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={handleLogout}
                    >
                      <SignOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          {/* Top Section: About Me and Progress Overview */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="w-full lg:w-2/3">
              <AboutMe />
            </div>
            <div className="w-full lg:w-1/3">
              <StatsSummary />
            </div>
          </div>

          {/* Recent Projects Section */}
          <div className="mt-12">
            <RecentProjects />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Profile

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Gear,
  ArrowLeft as PhArrowLeft,
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
import { Achievements } from '@/components/profile/Achievements'
import { ProjectGraph } from '@/components/profile/ProjectGraph'
import { Spinner } from '@/components/ui/spinner'
import { useImageCache } from '@/hooks/useImageCache'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.5 }
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

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
    <div className="min-h-screen bg-gradient-to-b from-background/50 to-background">
      <Header />
      <main className="min-h-screen bg-white dark:bg-background pt-20">
        {/* Profile Header */}
        <motion.div 
          className="border-b border-border/10 bg-white dark:bg-background/30 backdrop-blur-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar with Upload Button */}
              <motion.div 
                className="relative group"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Avatar className="w-24 h-24 border-2 border-border/20 shadow-xl ring-2 ring-background/50">
                  {imageLoading && !imageError && (
                    <div className="h-full w-full flex items-center justify-center bg-muted/20 backdrop-blur-sm">
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
                    <AvatarFallback className="text-xl bg-primary/5 backdrop-blur-sm">{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-border/20"
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
              </motion.div>

              {/* Profile Details */}
              <motion.div 
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-baseline space-x-3">
                      <h2 className="text-foreground text-2xl font-bold leading-none">
                        {profile?.name || 'Producer Name'}
                      </h2>
                      <span className="text-muted-foreground/80 text-base leading-none px-2 py-1 rounded-full bg-muted/20 backdrop-blur-sm">
                        @{profile?.artist_name || 'artist'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground/80 px-2 py-1 rounded-full bg-muted/20 backdrop-blur-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Member since {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-background/50 backdrop-blur-sm border-border/20 hover:bg-background/80"
                      onClick={() => navigate('/profile/settings')}
                    >
                      <Gear className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto bg-destructive/10 backdrop-blur-sm hover:bg-destructive/20"
                      onClick={handleLogout}
                    >
                      <SignOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="max-w-6xl mx-auto px-4 md:px-8 py-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* About Me Section */}
          <motion.div 
            className="w-full"
            variants={fadeInUp}
          >
            <AboutMe />
          </motion.div>

          {/* Progress Overview Section - Moved below About Me */}
          <motion.div 
            className="mt-8 w-full max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            <hr className="border-muted my-6" />
            <StatsSummary />
          </motion.div>

          {/* Project Graph Section */}
          <motion.div 
            className="mt-12"
            variants={fadeInUp}
          >
            <ProjectGraph />
          </motion.div>

          {/* Achievements Section */}
          <motion.div 
            className="mt-12"
            variants={fadeInUp}
          >
            <Achievements />
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default Profile

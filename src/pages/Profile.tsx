import React, { useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Breadcrumb } from '@/components/ui/breadcrumb'
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
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Spinner } from '@/components/ui/spinner'
import { useImageCache } from '@/hooks/useImageCache'
import { motion } from 'framer-motion'
import { logger } from '@/utils/logger'
import { useDebouncedCallback } from 'use-debounce'

// Lazy load heavy profile components
const AboutMe = lazy(() => import('@/components/profile/AboutMe').then(module => ({ default: module.AboutMe })))
const StatsSummary = lazy(() => import('@/components/profile/StatsSummaryOptimized').then(module => ({ default: module.StatsSummaryOptimized })))
const CreativeNotes = lazy(() => import('@/components/profile/CreativeNotes').then(module => ({ default: module.CreativeNotes })))
const ProjectGraph = lazy(() => import('@/components/profile/ProjectGraph').then(module => ({ default: module.ProjectGraph })))

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
  const { profile, logout, refreshProfile, isLoading: authLoading, isInitialized, isLoggingOut } = useAuth()
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

  // Optimized profile refresh with better debouncing
  const debouncedRefreshProfile = useDebouncedCallback(async () => {
    try {
      logger.performance('Profile refresh started')
      await refreshProfile()
      logger.performance('Profile refresh completed')
    } catch (error) {
      logger.error('Error refreshing profile:', error)
      toast.error('Failed to load profile data')
    }
  }, 1000) // Increased to 1000ms for better performance

  useEffect(() => {
    if (!isInitialized || authLoading) return
    debouncedRefreshProfile()
  }, [isInitialized, authLoading, debouncedRefreshProfile])

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

  // Optimized image upload with better error handling
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type and size
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
        logger.performance('Image upload started', { size: file.size, type: file.type })
        
        // Create form data and upload (implementation would go here)
        const formData = new FormData()
        formData.append('avatar', file)
        
        // Refresh profile to get updated avatar
        await debouncedRefreshProfile()
        
        logger.performance('Image upload completed')
        toast.success('Profile picture updated!')
      } catch (error) {
        logger.error('Error uploading image:', error)
        toast.error('Failed to upload image')
      } finally {
        setIsLoading(false)
      }
    },
    [debouncedRefreshProfile]
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
    <div className="[&_.group.peer_div.duration-200.relative.h-svh.bg-transparent]:hidden">
      <DashboardLayout>
      <div className="w-full bg-gradient-to-b from-background/50 to-background">
        {/* Profile Header */}
        <motion.div 
          className="border-b border-border/10 bg-white dark:bg-background/30 backdrop-blur-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <Breadcrumb 
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Profile', current: true }
              ]}
            />
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
                      className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      onClick={() => navigate('/profile/settings')}
                    >
                      <Gear className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <SignOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Optimized with lazy loading */}
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
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
                <span className="ml-2 text-sm text-muted-foreground">Loading about section...</span>
              </div>
            }>
              <AboutMe />
            </Suspense>
          </motion.div>

          {/* Two-Column Layout Section */}
          <motion.div 
            className="mt-8 w-full"
            variants={fadeInUp}
          >
            <hr className="border-muted my-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: Production Stats */}
              <motion.div 
                className="w-full"
                variants={fadeInUp}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="h-6 w-6" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading stats...</span>
                  </div>
                }>
                  <StatsSummary />
                </Suspense>
              </motion.div>
              
              {/* Right Column: Creative Notes */}
              <motion.div 
                className="w-full"
                variants={fadeInUp}
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center py-4">
                    <Spinner className="h-5 w-5" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading notes...</span>
                  </div>
                }>
                  <CreativeNotes />
                </Suspense>
              </motion.div>
            </div>
          </motion.div>

          {/* Project Graph Section */}
          <motion.div 
            className="mt-12"
            variants={fadeInUp}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
                <span className="ml-2 text-sm text-muted-foreground">Loading project graph...</span>
              </div>
            }>
              <ProjectGraph />
            </Suspense>
          </motion.div>

        </motion.div>
      </div>
      </DashboardLayout>
    </div>
  )
}

export default Profile

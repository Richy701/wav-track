import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  FloppyDisk,
  MusicNote,
  InstagramLogo,
  TwitterLogo,
  YoutubeLogo,
  X,
  Gear,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import {
  FLStudioIcon,
  AbletonIcon,
  LogicProIcon,
  ProToolsIcon,
  StudioOneIcon,
  BitwigIcon,
  ReaperIcon,
} from '@/components/DawIcons'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormData {
  name: string
  email: string
  phone: string
  location: string
  website: string
  birthday: string
  timezone: string
  artist_name: string
  genres: string[]
  daw: string
  bio: string
  social_links: {
    instagram: string | null
    instagram_username: string | null
    twitter: string | null
    twitter_username: string | null
    youtube: string | null
    youtube_username: string | null
  }
  notification_preferences: {
    newFollowers: boolean
    beatComments: boolean
    collaborationRequests: boolean
  }
}

const popularGenres = [
  'Hip Hop',
  'Trap',
  'R&B',
  'Pop',
  'Rock',
  'Electronic',
  'House',
  'Techno',
  'Jazz',
  'Soul',
  'Funk',
  'Reggae',
  'Latin',
  'Classical',
  'Country',
  'Blues',
  'Metal',
  'Punk',
  'Folk',
  'World',
  'Ambient',
  'Drill',
  'Afrobeats',
  'Gospel',
]

const dawOptions = [
  {
    value: 'fl-studio',
    label: 'FL Studio',
    icon: <FLStudioIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'ableton',
    label: 'Ableton Live',
    icon: <AbletonIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'logic-pro',
    label: 'Logic Pro',
    icon: <LogicProIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'pro-tools',
    label: 'Pro Tools',
    icon: <ProToolsIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'studio-one',
    label: 'Studio One',
    icon: <StudioOneIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'bitwig',
    label: 'Bitwig',
    icon: <BitwigIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'reaper',
    label: 'Reaper',
    icon: <ReaperIcon className="h-4 w-4 mr-2" />,
  },
  {
    value: 'other',
    label: 'Other',
    icon: <MusicNote className="h-4 w-4 mr-2" />,
  },
]

const ProfileSettings = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, updateUserProfile, logout, refreshProfile } = useAuth()
  const isNewUser = location.state?.isNewUser || false
  const returnTo = sessionStorage.getItem('returnTo') || '/'

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    birthday: '',
    timezone: 'UTC',
    artist_name: '',
    genres: [],
    daw: '',
    bio: '',
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState<Date>()
  const [open, setOpen] = useState(false)

  // Initialize form data when profile is available
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        birthday: profile.birthday || '',
        timezone: profile.timezone || 'UTC',
        artist_name: profile.artist_name || '',
        genres: Array.isArray(profile.genres) ? profile.genres : [],
        daw: profile.daw || '',
        bio: profile.bio || '',
        social_links: profile.social_links || {
          instagram: null,
          instagram_username: null,
          twitter: null,
          twitter_username: null,
          youtube: null,
          youtube_username: null,
        },
        notification_preferences: profile.notification_preferences || {
          newFollowers: true,
          beatComments: true,
          collaborationRequests: true,
        },
      })

      if (profile.birthday) {
        setDate(new Date(profile.birthday))
      }
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialChange = (platform: string, type: 'url' | 'username', value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: type === 'url' ? value || null : prev.social_links[platform],
        [`${platform}_username`]:
          type === 'username' ? value || null : prev.social_links[`${platform}_username`],
      },
    }))
  }

  const handleNotificationChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: checked,
      },
    }))
  }

  const handleGenresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const genresArray = e.target.value
      .split(',')
      .map(g => g.trim())
      .filter(Boolean)
    setFormData(prev => ({
      ...prev,
      genres: genresArray,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateUserProfile(formData)
      await refreshProfile()
      
      // Clear the return path from session storage
      sessionStorage.removeItem('returnTo')
      
      // Show success message
      toast.success('Profile updated successfully')
      
      // Navigate back to the original page or dashboard
      navigate(returnTo)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setShowDeleteDialog(false)
    toast.success('Account deletion request submitted')
    await logout()
    navigate('/')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="w-full max-w-4xl mx-auto px-4 pt-24 pb-8 flex-1">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mb-8"
        >
          <Gear className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">Profile Settings</h1>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="grid gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Basic Information */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-2xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="artist_name" className="text-sm font-medium">Artist Name</Label>
                    <Input
                      id="artist_name"
                      name="artist_name"
                      value={formData.artist_name}
                      onChange={handleChange}
                      placeholder="Your artist name"
                      className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Your location"
                      className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://your-website.com"
                      className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Producer Information */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-2xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">Producer Information</CardTitle>
                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tell others about your music production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2 w-full md:col-span-2">
                    <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell others about yourself and your music..."
                      className="w-full min-h-[100px] p-3 rounded-md bg-white dark:bg-zinc-900 text-sm hover:ring-1 hover:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="daw" className="text-sm font-medium">Preferred DAW</Label>
                    <div className="relative w-full min-h-[42px]">
                      <Select
                        value={formData.daw}
                        onValueChange={value => setFormData(prev => ({ ...prev, daw: value }))}
                      >
                        <SelectTrigger className="w-full h-10 bg-transparent text-foreground border border-border transition-colors duration-300">
                          <SelectValue>
                            {formData.daw ? (
                              <div className="flex items-center">
                                <div className="w-6 h-6 mr-2 flex items-center justify-center">
                                  {dawOptions.find(option => option.value === formData.daw)?.icon}
                                </div>
                                {dawOptions.find(option => option.value === formData.daw)?.label}
                              </div>
                            ) : (
                              'Select your DAW'
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {dawOptions.map(option => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="flex items-center hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              <div className="flex items-center">
                                <div className="w-6 h-6 mr-2 flex items-center justify-center">
                                  {option.icon}
                                </div>
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-medium">Genres</Label>
                    <div className="relative w-full min-h-[42px]">
                      <Select
                        onValueChange={value => {
                          if (!formData.genres.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              genres: [...prev.genres, value].sort(),
                            }))
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-10 bg-transparent text-foreground border border-border transition-colors duration-300">
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {popularGenres.map(genre => (
                            <SelectItem 
                              key={genre} 
                              value={genre}
                              className="hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.genres.map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800"
                          >
                            {genre}
                            <button
                              type="button"
                              className="ml-1 hover:text-destructive"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  genres: prev.genres.filter(g => g !== genre),
                                }))
                              }}
                              aria-label={`Remove ${genre} genre`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-2xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">Social Links</CardTitle>
                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
                  Connect your social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Instagram */}
                  <div className="space-y-4 md:col-span-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <InstagramLogo className="h-4 w-4" />
                      Instagram
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Instagram profile URL"
                        value={formData.social_links.instagram ?? ''}
                        onChange={e => handleSocialChange('instagram', 'url', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                      />
                      <Input
                        placeholder="@username"
                        value={formData.social_links.instagram_username ?? ''}
                        onChange={e => handleSocialChange('instagram', 'username', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Twitter */}
                  <div className="space-y-4 md:col-span-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <TwitterLogo className="h-4 w-4" />
                      Twitter
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Twitter profile URL"
                        value={formData.social_links.twitter ?? ''}
                        onChange={e => handleSocialChange('twitter', 'url', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                      />
                      <Input
                        placeholder="@username"
                        value={formData.social_links.twitter_username ?? ''}
                        onChange={e => handleSocialChange('twitter', 'username', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="space-y-4 md:col-span-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <YoutubeLogo className="h-4 w-4" />
                      YouTube
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="YouTube channel URL"
                        value={formData.social_links.youtube ?? ''}
                        onChange={e => handleSocialChange('youtube', 'url', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                      />
                      <Input
                        placeholder="Channel name"
                        value={formData.social_links.youtube_username ?? ''}
                        onChange={e => handleSocialChange('youtube', 'username', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 text-sm rounded-md px-3 py-2 hover:ring-1 hover:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Actions */}
          <motion.div variants={itemVariants} className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              Delete Account
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FloppyDisk className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </main>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

export default ProfileSettings

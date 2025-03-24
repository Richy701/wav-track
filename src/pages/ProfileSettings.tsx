import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ArrowLeft as PhArrowLeft,
  FloppyDisk,
  MusicNote,
  InstagramLogo,
  TwitterLogo,
  YoutubeLogo,
  X,
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
  const { profile, updateUserProfile, logout, refreshProfile } = useAuth()

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
        genres: profile.genres || [],
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
      const updatedProfile = await updateUserProfile({
        name: formData.name,
        email: formData.email,
        artist_name: formData.artist_name,
        genres: formData.genres,
        daw: formData.daw,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        website: formData.website,
        birthday: formData.birthday,
        timezone: formData.timezone,
        social_links: formData.social_links,
        notification_preferences: formData.notification_preferences,
      })

      // Refresh profile to get the latest data
      await refreshProfile()
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-10 flex-1">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <PhArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artist Name</Label>
                  <Input
                    id="artist_name"
                    name="artist_name"
                    value={formData.artist_name}
                    onChange={handleChange}
                    placeholder="Your artist name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Your location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Producer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Producer Information</CardTitle>
              <CardDescription>Tell others about your music production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell others about yourself and your music..."
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daw">Preferred DAW</Label>
                <Select
                  value={formData.daw}
                  onValueChange={value => setFormData(prev => ({ ...prev, daw: value }))}
                >
                  <SelectTrigger className="w-full">
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
                        className="flex items-center"
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
              <div className="space-y-2">
                <Label>Genres</Label>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularGenres.map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.genres.map(genre => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1"
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
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instagram */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <InstagramLogo className="h-4 w-4" />
                  Instagram
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Instagram profile URL"
                    value={formData.social_links.instagram ?? ''}
                    onChange={e => handleSocialChange('instagram', 'url', e.target.value)}
                  />
                  <Input
                    placeholder="@username"
                    value={formData.social_links.instagram_username ?? ''}
                    onChange={e => handleSocialChange('instagram', 'username', e.target.value)}
                  />
                </div>
              </div>

              {/* Twitter */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <TwitterLogo className="h-4 w-4" />
                  Twitter
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Twitter profile URL"
                    value={formData.social_links.twitter ?? ''}
                    onChange={e => handleSocialChange('twitter', 'url', e.target.value)}
                  />
                  <Input
                    placeholder="@username"
                    value={formData.social_links.twitter_username ?? ''}
                    onChange={e => handleSocialChange('twitter', 'username', e.target.value)}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <YoutubeLogo className="h-4 w-4" />
                  YouTube
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="YouTube channel URL"
                    value={formData.social_links.youtube ?? ''}
                    onChange={e => handleSocialChange('youtube', 'url', e.target.value)}
                  />
                  <Input
                    placeholder="Channel name"
                    value={formData.social_links.youtube_username ?? ''}
                    onChange={e => handleSocialChange('youtube', 'username', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Followers</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when someone follows you
                  </p>
                </div>
                <Switch
                  checked={formData.notification_preferences.newFollowers}
                  onCheckedChange={checked => handleNotificationChange('newFollowers', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Beat Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when someone comments on your beats
                  </p>
                </div>
                <Switch
                  checked={formData.notification_preferences.beatComments}
                  onCheckedChange={checked => handleNotificationChange('beatComments', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Collaboration Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new collaboration requests
                  </p>
                </div>
                <Switch
                  checked={formData.notification_preferences.collaborationRequests}
                  onCheckedChange={checked =>
                    handleNotificationChange('collaborationRequests', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </form>
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

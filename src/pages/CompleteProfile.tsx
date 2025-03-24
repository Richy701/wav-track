import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { toast } from 'sonner'
import { Profile } from '@/contexts/AuthContext'

const GENRES = [
  'Hip Hop',
  'R&B',
  'Pop',
  'Rock',
  'Electronic',
  'Jazz',
  'Classical',
  'Country',
  'Latin',
  'World',
]

const DAWS = [
  'Ableton Live',
  'FL Studio',
  'Logic Pro',
  'Pro Tools',
  'Cubase',
  'Studio One',
  'Reason',
  'Reaper',
  'Other',
]

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export default function CompleteProfile() {
  const { profile, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Profile>>({
    artist_name: '',
    genres: [],
    daw: '',
    bio: '',
    location: '',
    timezone: 'UTC',
  })

  useEffect(() => {
    // Pre-populate form with existing profile data
    if (profile) {
      setFormData(prev => ({
        ...prev,
        artist_name: profile.artist_name || '',
        genres: profile.genres || [],
        daw: profile.daw || '',
        bio: profile.bio || '',
        location: profile.location || '',
        timezone: profile.timezone || 'UTC',
      }))
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserProfile(formData)
      toast.success('Profile completed successfully!')
      
      // Navigate to the intended destination or dashboard
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="artist_name">Artist Name</Label>
              <Input
                id="artist_name"
                value={formData.artist_name}
                onChange={e => setFormData(prev => ({ ...prev, artist_name: e.target.value }))}
                placeholder="Your artist name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Genres</Label>
              <MultiSelect
                options={GENRES}
                value={formData.genres}
                onChange={genres => setFormData(prev => ({ ...prev, genres }))}
                placeholder="Select genres"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daw">Primary DAW</Label>
              <Select
                value={formData.daw}
                onValueChange={value => setFormData(prev => ({ ...prev, daw: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your DAW" />
                </SelectTrigger>
                <SelectContent>
                  {DAWS.map(daw => (
                    <SelectItem key={daw} value={daw}>
                      {daw}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Select your primary Digital Audio Workstation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself and your music"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Your city or region"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={value => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
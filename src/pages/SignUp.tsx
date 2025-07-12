import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { theme } from '@/styles/theme'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Globe,
  Phone,
  MapPin,
  Music,
  Mic2,
  Radio,
  Drum,
  Guitar,
  Piano,
  RadioReceiver,
  Music2,
  Drumstick,
} from 'lucide-react'



// Genre options with icons
const genres = [
  { id: 'trap', label: 'Trap', icon: Drum },
  { id: 'hip-hop', label: 'Hip Hop', icon: Mic2 },
  { id: 'rnb', label: 'R&B', icon: Radio },
  { id: 'lofi', label: 'Lo-fi', icon: Guitar },
  { id: 'drill', label: 'Drill', icon: Drumstick },
  { id: 'pop', label: 'Pop', icon: Music },
  { id: 'electronic', label: 'Electronic', icon: Radio },
  { id: 'house', label: 'House', icon: RadioReceiver },
  { id: 'techno', label: 'Techno', icon: Radio },
  { id: 'ambient', label: 'Ambient', icon: Radio },
  { id: 'experimental', label: 'Experimental', icon: Music2 },
]

// DAW options with descriptions
const daws = [
  {
    value: 'ableton',
    label: 'Ableton Live',
    description: 'Perfect for live performance and electronic music',
  },
  { value: 'fl', label: 'FL Studio', description: 'Great for beat making and hip hop production' },
  { value: 'logic', label: 'Logic Pro', description: 'Excellent for recording and mixing' },
  {
    value: 'pro-tools',
    label: 'Pro Tools',
    description: 'Industry standard for professional recording',
  },
]

export function SignUp() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [artistName, setArtistName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    phone: '',
    website: '',
    daw: '',
  })
  const maxBioLength = 500

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("SignUp: Form submission started")
      console.log("SignUp: Data being sent:", {
        formData,
        artistName,
        selectedGenres,
        bio
      })

      const success = await register({
        ...formData,
        artist_name: artistName,
        genres: selectedGenres,
        bio,
      })

      console.log("SignUp: Register response:", success)

      if (success) {
        console.log("SignUp: Registration successful, navigating to dashboard")
        navigate('/dashboard')
      }
    } catch (err) {
      console.error("SignUp: Registration error:", err)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err instanceof Error ? err.message : "An error occurred during registration",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const generateStageName = () => {
    const adjectives = [
      'Mystic',
      'Cosmic',
      'Urban',
      'Digital',
      'Neon',
      'Crystal',
      'Shadow',
      'Golden',
    ]
    const nouns = ['Pulse', 'Wave', 'Beats', 'Sound', 'Rhythm', 'Flow', 'Vibe', 'Soul']
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    setArtistName(`${randomAdjective} ${randomNoun}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dashboard Preview */}
          <div className={cn(theme.card.base, 'p-6', 'hidden lg:block')}>
            <h2 className={cn(theme.text.heading, 'text-2xl mb-6')}>Your Dashboard Preview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div
                className={cn(
                  'p-4 rounded-lg',
                  'bg-white/50 dark:bg-zinc-800/50',
                  'border border-zinc-200 dark:border-zinc-700',
                  'text-center'
                )}
              >
                <div className={cn(theme.text.heading, 'text-2xl font-bold mb-1')}>
                  0
                </div>
                <div className={cn(theme.text.muted, 'text-sm')}>Total Beats</div>
              </div>
              <div
                className={cn(
                  'p-4 rounded-lg',
                  'bg-white/50 dark:bg-zinc-800/50',
                  'border border-zinc-200 dark:border-zinc-700',
                  'text-center'
                )}
              >
                <div className={cn(theme.text.heading, 'text-2xl font-bold mb-1')}>
                  0
                </div>
                <div className={cn(theme.text.muted, 'text-sm')}>Projects</div>
              </div>
              <div
                className={cn(
                  'p-4 rounded-lg',
                  'bg-white/50 dark:bg-zinc-800/50',
                  'border border-zinc-200 dark:border-zinc-700',
                  'text-center'
                )}
              >
                <div className={cn(theme.text.heading, 'text-2xl font-bold mb-1')}>
                  0
                </div>
                <div className={cn(theme.text.muted, 'text-sm')}>Collaborations</div>
              </div>
            </div>

            {/* Recent Beats */}
            <div>
              <h3 className={cn(theme.text.heading, 'text-lg mb-4')}>Recent Beats</h3>
              <div className="space-y-3">
                <div className={cn(theme.text.muted, 'text-sm text-center py-8')}>
                  No beats created yet
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className={cn(theme.card.base, 'p-6')}>
            <h2 className={cn(theme.text.heading, 'text-2xl mb-6')}>Create Your Account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(theme.input.base)}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(theme.input.base)}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(theme.input.base)}
                  />
                </div>
              </div>

              {/* Artist Profile Section */}
              <div
                className={cn(
                  'p-4 rounded-lg',
                  'bg-zinc-50 dark:bg-zinc-800/50',
                  'border border-zinc-200 dark:border-zinc-700',
                  'space-y-4'
                )}
              >
                <h3 className={cn(theme.text.heading, 'text-lg')}>Artist Profile</h3>

                <div>
                  <Label htmlFor="artistName">Stage Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="artistName"
                      value={artistName}
                      onChange={e => setArtistName(e.target.value)}
                      placeholder="Your stage name"
                      className={cn(theme.input.base)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateStageName}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Genres</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genres.map(genre => {
                      const Icon = genre.icon
                      const isSelected = selectedGenres.includes(genre.id)
                      return (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() => toggleGenre(genre.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm',
                            'flex items-center gap-1.5',
                            'transition-all duration-200',
                            'border',
                            isSelected
                              ? 'bg-primary text-white border-primary/20 shadow-sm'
                              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-primary/50 dark:hover:border-primary/50'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              isSelected ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'
                            )}
                          />
                          {genre.label}
                        </button>
                      )
                    })}
                  </div>
                  <p className={cn(theme.text.muted, 'text-sm mt-2')}>Select your primary genres</p>
                </div>

                <div>
                  <Label htmlFor="daw">Preferred DAW</Label>
                  <div className="relative">
                    <select
                      id="daw"
                      name="daw"
                      aria-label="Select your preferred DAW"
                      className={cn(theme.input.base, 'appearance-none pr-8')}
                    >
                      <option value="">Select your DAW</option>
                      {daws.map(daw => (
                        <option key={daw.value} value={daw.value}>
                          {daw.label}
                        </option>
                      ))}
                    </select>
                    <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <p className={cn(theme.text.muted, 'text-sm mt-1')}>
                    Choose your primary digital audio workstation
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about your music journey..."
                    maxLength={maxBioLength}
                    className={cn(theme.input.base)}
                  />
                  <div className={cn(theme.text.muted, 'text-sm mt-1 text-right')}>
                    {bio.length}/{maxBioLength}
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className={cn(
                    'flex items-center gap-2',
                    theme.text.body,
                    'hover:text-primary dark:hover:text-primary',
                    'transition-colors duration-200'
                  )}
                >
                  {showOptionalFields ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Optional Fields
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Optional Fields
                    </>
                  )}
                </button>

                {showOptionalFields && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="location">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="City, Country"
                        className={cn(theme.input.base)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={cn(theme.input.base)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        className={cn(theme.input.base)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className={cn(theme.button.primary, 'w-full')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className={cn(theme.text.muted, 'text-center mt-6')}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className={cn(theme.text.link, 'font-medium')}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import {
  Plus,
  Calendar as PhCalendar,
  Sparkle,
  MusicNote,
  Timer as PhTimer,
  Queue as PhQueue,
  UploadSimple,
  Tag as PhTag,
  X as PhX,
  CircleNotch,
  Play,
  Pause,
} from '@phosphor-icons/react'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Project } from '@/lib/types'
import { recordBeatCreation } from '@/lib/data'
import { AudioUploader } from '@/components/audio/AudioUploader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { analyzeAudioWithSpotify, updateProjectWithAnalysis } from '@/lib/services/spotifyAnalysis'
import { supabase } from '@/lib/supabase'

interface CreateProjectDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectsCount: number
  onProjectCreated?: () => void
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  isOpen,
  onOpenChange,
  projectsCount,
  onProjectCreated,
}) => {
  const queryClient = useQueryClient()
  const { addProject, isAddingProject } = useProjects()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [formData, setFormData] = useState<Omit<Project, 'id' | 'genre'> & { genres: string[] }>({
    title: '',
    description: '',
    status: 'idea' as const,
    bpm: 120,
    key: 'C',
    genres: [],
    tags: [],
    completionPercentage: 0,
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    is_deleted: false,
    deleted_at: null,
    user_id: '',
    audio_url: null
  })

  // Initialize audio element when audio URL changes
  useEffect(() => {
    if (audioUrl?.trim()) {
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      // Add event listeners
      audio.addEventListener('ended', () => setIsPlaying(false))
      audio.addEventListener('pause', () => setIsPlaying(false))
      audio.addEventListener('play', () => setIsPlaying(true))
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e)
        toast.error('Audio Error', {
          description: 'Failed to load the audio file.',
        })
      })

      // Cleanup
      return () => {
        audio.pause()
        audio.removeEventListener('ended', () => setIsPlaying(false))
        audio.removeEventListener('pause', () => setIsPlaying(false))
        audio.removeEventListener('play', () => setIsPlaying(true))
        audio.removeEventListener('error', () => {})
      }
    }
  }, [audioUrl])

  // Handle audio playback
  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!audioRef.current) {
      console.warn('Audio element not initialized')
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error)
        toast.error('Failed to play audio', {
          description: 'There was an error playing the audio file.',
        })
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.genres.length === 0) {
      newErrors.genres = 'At least one genre is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'bpm') {
      const bpmValue = Number(value)
      if (!isNaN(bpmValue) && bpmValue > 0 && bpmValue <= 300) {
        setFormData(prev => ({ ...prev, [name]: bpmValue }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBpmChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, bpm: value[0] }))
  }

  const handleStatusChange = (value: string) => {
    const status = value as Project['status']
    const completionPercentage = getCompletionPercentage(status)
    setFormData(prev => ({
      ...prev,
      status,
      completionPercentage,
    }))
  }

  const handleGenreChange = (value: string) => {
    if (!formData.genres.includes(value)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, value].sort(),
      }))
    }
    if (errors.genres) {
      setErrors(prev => ({ ...prev, genres: '' }))
    }
  }

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove),
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, dateCreated: date.toISOString() }))
    }
  }

  const getCompletionPercentage = (
    status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'
  ): number => {
    switch (status) {
      case 'idea':
        return 0
      case 'in-progress':
        return 25
      case 'mixing':
        return 50
      case 'mastering':
        return 75
      case 'completed':
        return 100
      default:
        return 0
    }
  }

  const resetForm = () => {
    const now = new Date().toISOString()
    setFormData({
      title: '',
      description: '',
      status: 'idea' as const,
      bpm: 120,
      key: 'C',
      genres: [],
      tags: [],
      completionPercentage: 0,
      dateCreated: now,
      lastModified: now,
      created_at: now,
      last_modified: now,
      is_deleted: false,
      deleted_at: null,
      user_id: '',
      audio_url: null
    })
    setErrors({})
    setAudioUrl(null)
    setAudioFileName(null)
  }

  const handleAudioUpload = async (url: string, fileName: string) => {
    setAudioUrl(url)
    setAudioFileName(fileName)
    setFormData(prev => ({ ...prev, audio_url: url }))
    
    // Start analysis immediately after upload
    setIsAnalyzing(true)
    try {
      console.log('Starting audio analysis...')
      const analysis = await analyzeAudioWithSpotify(url)
      console.log('Analysis complete:', analysis)
      
      // Pre-fill form with analysis results
      setFormData(prev => ({
        ...prev,
        bpm: analysis.bpm,
        key: `${analysis.key} ${analysis.mode}`,
        timeSignature: analysis.timeSignature,
      }))
      
      if (analysis.analyzed) {
        toast.success('Audio analysis complete', {
          description: `BPM: ${analysis.bpm} • Key: ${analysis.key} ${analysis.mode} • Time: ${analysis.timeSignature}/4`,
        })
      } else {
        toast.warning('Audio analysis not available', {
          description: 'The audio file could not be analyzed at this time.',
        })
      }
    } catch (error) {
      console.error('Analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Audio analysis failed', {
        description: `Error: ${errorMessage}`,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCreateBeat = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No user found')
      }

      // Create the project object with a temporary ID
      const now = new Date().toISOString()
      const newProject: Project = {
        id: crypto.randomUUID(),
        title: formData.title || 'Untitled Project',
        description: formData.description || '',
        status: 'idea' as const,
        user_id: user.id,
        created_at: now,
        last_modified: now,
        is_deleted: false,
        deleted_at: null,
        // Client-side fields
        dateCreated: now,
        lastModified: now,
        bpm: formData.bpm,
        key: formData.key,
        genre: formData.genres.join(', '),
        tags: formData.tags,
        completionPercentage: formData.completionPercentage,
        audio_url: audioUrl // Now this is properly typed as string | null
      }

      console.log('Creating project with audio URL:', {
        audio_url: newProject.audio_url,
        audioUrl: audioUrl,
        formData_audio_url: formData.audio_url
      })

      // Create the project with the audio URL included
      const createdProject = await addProject(newProject)

      if (!createdProject) {
        throw new Error('Failed to create project')
      }

      // Record the beat activity with the database-generated ID
      await recordBeatCreation(createdProject.id, 1)

      // Show success toast
      toast.success('Project created successfully', {
        description: 'Your new project has been added to the list.',
      })

      // Close dialog and reset form
      onOpenChange(false)
      resetForm()

      // Notify parent component and trigger a refresh
      onProjectCreated?.()
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['beatActivities'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    } catch (error) {
      console.error('Error creating project:', error)
      
      // Show error toast
      toast.error('Failed to create project', {
        description: 'An error occurred while creating your project. Please try again.',
      })

      // Reopen dialog with form data intact
      onOpenChange(true)
    }
  }

  const genreOptions = [
    'Hip Hop',
    'Trap',
    'R&B',
    'Pop',
    'Electronic',
    'House',
    'Techno',
    'Drill',
    'Soul',
    'Jazz',
    'Lo-Fi',
    'Reggaeton',
    'Afrobeat',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your collection. You can add audio files, set BPM, key, and more.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateBeat} className="space-y-6">
          <div className="grid gap-6 py-3">
            {/* Title and Description Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="title" className="text-right text-sm font-medium">
                  Title
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                    <div className="p-1 rounded-md bg-violet-500/10">
                      <MusicNote weight="fill" className="h-4 w-4 text-violet-500" />
                    </div>
                  </div>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={cn(
                      'pl-10 h-9 text-sm transition-colors',
                      errors.title
                        ? 'border-destructive focus-visible:ring-destructive'
                        : 'focus-visible:ring-primary'
                    )}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                      {errors.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-3">
                <Label htmlFor="description" className="text-right text-sm font-medium mt-1">
                  Description
                </Label>
                <div className="col-span-3">
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter project description"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Genre Section */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label htmlFor="genre" className="text-right text-sm font-medium">
                Genres
              </Label>
              <div className="col-span-3 relative space-y-2">
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                    <div className="p-1 rounded-md bg-pink-500/10">
                      <PhTag weight="fill" className="h-4 w-4 text-pink-500" />
                    </div>
                  </div>
                  <Select value="" onValueChange={handleGenreChange} name="genre">
                    <SelectTrigger
                      id="genre"
                      name="genre"
                      className={cn(
                        'pl-10 h-9 text-sm transition-colors',
                        errors.genres
                          ? 'border-destructive focus-visible:ring-destructive'
                          : 'focus-visible:ring-primary'
                      )}
                      aria-label="Select project genres"
                      aria-describedby={errors.genres ? 'genre-error' : undefined}
                    >
                      <SelectValue placeholder="Select genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-sm">Genres</SelectLabel>
                        {genreOptions.map(genre => (
                          <SelectItem
                            key={genre}
                            value={genre}
                            role="option"
                            disabled={formData.genres.includes(genre)}
                            className="cursor-pointer transition-colors hover:bg-muted/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
                          >
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Genres */}
                {formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.genres.map(genre => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="text-xs bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                      >
                        {genre}
                        <button
                          type="button"
                          onClick={() => handleRemoveGenre(genre)}
                          className="ml-1 hover:text-pink-600"
                          aria-label={`Remove ${genre} genre`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.genres && (
                  <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                    {errors.genres}
                  </p>
                )}
              </div>
            </div>

            {/* BPM and Key Section */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="bpm" className="text-right text-sm font-medium">
                BPM
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-amber-500/10">
                    <PhTimer weight="fill" className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <Input
                  type="number"
                  id="bpm"
                  name="bpm"
                  value={formData.bpm}
                  onChange={handleInputChange}
                  min="20"
                  max="300"
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="key" className="text-right text-sm font-medium">
                Key
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-emerald-500/10">
                    <Sparkle weight="fill" className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <Select value={formData.key} onValueChange={value => setFormData(prev => ({ ...prev, key: value }))}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-sm">Musical Key</SelectLabel>
                      {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                        <SelectItem key={key} value={key} className="text-sm">
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Section */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="date" className="text-right text-sm font-medium">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal hover:bg-accent/50 transition-colors pl-10 h-9 text-sm relative',
                        'focus-visible:ring-primary'
                      )}
                    >
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                        <div className="p-1 rounded-md bg-blue-500/10">
                          <PhCalendar weight="fill" className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      {formData.dateCreated
                        ? format(new Date(formData.dateCreated), 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.dateCreated)}
                      onSelect={handleDateChange}
                      initialFocus
                      className="rounded-md border shadow"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Status Section */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                  <div className="p-1 rounded-md bg-indigo-500/10">
                    <PhQueue weight="fill" className="h-4 w-4 text-indigo-500" />
                  </div>
                </div>
                <Select value={formData.status} onValueChange={handleStatusChange} name="status">
                  <SelectTrigger
                    id="status"
                    className="pl-10 h-9 text-sm hover:bg-accent/50 transition-colors focus-visible:ring-primary"
                    aria-label="Select project status"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background dark:bg-background border shadow-lg min-w-[200px]">
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground px-3 py-1.5">
                        Project Status
                      </SelectLabel>
                      <SelectItem
                        value="idea"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-red-600 dark:text-red-400">Idea</span>
                      </SelectItem>
                      <SelectItem
                        value="in-progress"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-orange-600 dark:text-orange-400">In Progress</span>
                      </SelectItem>
                      <SelectItem
                        value="mixing"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-yellow-600 dark:text-yellow-400">Mixing</span>
                      </SelectItem>
                      <SelectItem
                        value="mastering"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-blue-600 dark:text-blue-400">Mastering</span>
                      </SelectItem>
                      <SelectItem
                        value="completed"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-green-600 dark:text-green-400">Completed</span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Audio Upload Section */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label htmlFor="audio" className="text-right text-sm font-medium">
                Audio File
              </Label>
              <div className="col-span-3 space-y-3">
                <AudioUploader
                  onUploadComplete={handleAudioUpload}
                  className="w-full"
                />
                
                {/* Audio Preview */}
                {audioUrl && (
                  <div className="relative mt-4 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 border border-border/50 dark:border-border/30 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2 rounded-lg bg-background border border-border/50 dark:border-border/30 text-foreground group-hover:border-primary/50 dark:group-hover:border-primary/30 transition-colors">
                          <MusicNote className="h-5 w-5 animate-pulse-subtle" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-semibold text-foreground truncate max-w-[220px]" title={audioFileName || 'Audio file'}>
                            {audioFileName || 'Audio file'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Uploaded successfully
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handlePlayPause}
                        className={cn(
                          'w-12 h-12 rounded-full transition-all duration-300',
                          'flex items-center justify-center',
                          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-background',
                          'transform hover:scale-105 active:scale-95',
                          'hover:shadow-lg hover:shadow-emerald-500/25 dark:hover:shadow-purple-900/35',
                          isPlaying
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-violet-500 dark:via-fuchsia-600 dark:to-purple-700 shadow-lg shadow-emerald-500/30 dark:shadow-purple-900/40'
                            : 'bg-gradient-to-br from-emerald-300 to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 dark:from-violet-400 dark:via-fuchsia-500 dark:to-purple-600 shadow-md shadow-emerald-500/20 dark:shadow-purple-900/30'
                        )}
                        aria-label={isPlaying ? 'Pause Preview' : 'Play Preview'}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6 text-white drop-shadow-sm" weight="fill" />
                        ) : (
                          <Play className="h-6 w-6 ml-0.5 text-white drop-shadow-sm" weight="fill" />
                        )}
                      </button>
                    </div>
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                        <CircleNotch className="h-3.5 w-3.5 animate-spin" />
                        Analyzing audio file...
                      </div>
                    )}
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-violet-500 dark:to-purple-600 animate-progress" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="submit" disabled={isAnalyzing} className="w-full h-9 text-sm">
              {isAnalyzing ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectDialog

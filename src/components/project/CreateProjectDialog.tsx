import { useState, useRef, useEffect } from 'react'
import {
  PlusIcon,
  CalendarIcon,
  SparklesIcon,
  MusicalNoteIcon,
  ClockIcon,
  QueueListIcon,
  ArrowUpTrayIcon,
  TagIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline'
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
import { useQueryClient } from '@tanstack/react-query'
import { analyzeAudioWithSpotify, updateProjectWithAnalysis } from '@/lib/services/spotifyAnalysis'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import * as PopoverPrimitive from '@radix-ui/react-popover'

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
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const calendarTriggerRef = useRef<HTMLButtonElement>(null)

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

  // Prevent Dialog from closing Popover
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isCalendarOpen && calendarTriggerRef.current?.contains(e.target as Node)) {
        e.stopPropagation()
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isCalendarOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Close calendar when dialog closes
      if (!open) setIsCalendarOpen(false)
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-visible bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <div className="relative">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-light tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                New Project
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80 font-light">
                Add a new project to your collection
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateBeat} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column - Project Metadata */}
                <div className="space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-light">
                      Title
                    </Label>
                    <div className="relative group">
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={cn(
                          'h-10 pl-9 bg-background',
                          'rounded-md transition-all duration-200',
                          'border-border/60 group-hover:border-primary/60',
                          'focus:border-primary focus:ring-1 focus:ring-primary/20',
                          errors.title ? 'border-destructive' : ''
                        )}
                        placeholder="Enter project title"
                      />
                      <MusicalNoteIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                      {errors.title && (
                        <p className="text-xs text-destructive mt-1">{errors.title}</p>
                      )}
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-light">
                      Description
                    </Label>
                    <div className="relative group">
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="h-10 pl-9 bg-background rounded-md border-border/60 group-hover:border-primary/60 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        placeholder="Enter project description"
                      />
                      <QueueListIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    </div>
                  </div>

                  {/* Genre Select */}
                  <div className="space-y-2">
                    <Label htmlFor="genre" className="text-sm font-light">
                      Genres
                    </Label>
                    <div className="relative group">
                      <Select value="" onValueChange={handleGenreChange} name="genre">
                        <SelectTrigger
                          id="genre"
                          className={cn(
                            'h-10 pl-9 bg-background rounded-md',
                            'border-border/60 group-hover:border-primary/60',
                            'focus:border-primary focus:ring-1 focus:ring-primary/20',
                            'transition-all duration-200',
                            errors.genres ? 'border-destructive' : ''
                          )}
                        >
                          <SelectValue placeholder="Select genres" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="font-light">Genres</SelectLabel>
                            {genreOptions.map(genre => (
                              <SelectItem
                                key={genre}
                                value={genre}
                                disabled={formData.genres.includes(genre)}
                                className="cursor-pointer"
                              >
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <TagIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    </div>

                    {/* Selected Genres */}
                    {formData.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.genres.map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors group"
                          >
                            {genre}
                            <button
                              type="button"
                              onClick={() => handleRemoveGenre(genre)}
                              className="ml-1 hover:text-destructive focus:outline-none"
                            >
                              <XMarkIcon className="h-3 w-3 inline-block" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Technical Details */}
                <div className="space-y-6">
                  {/* BPM Input */}
                  <div className="space-y-2">
                    <Label htmlFor="bpm" className="text-sm font-light">
                      BPM
                    </Label>
                    <div className="relative group">
                      <Input
                        type="number"
                        id="bpm"
                        name="bpm"
                        value={formData.bpm}
                        onChange={handleInputChange}
                        min="20"
                        max="300"
                        className="h-10 pl-9 bg-background rounded-md border-border/60 group-hover:border-primary/60 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                      />
                      <ClockIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    </div>
                  </div>

                  {/* Key Select */}
                  <div className="space-y-2">
                    <Label htmlFor="key" className="text-sm font-light">
                      Key
                    </Label>
                    <div className="relative group">
                      <Select 
                        value={formData.key} 
                        onValueChange={value => setFormData(prev => ({ ...prev, key: value }))}
                      >
                        <SelectTrigger
                          className="h-10 pl-9 bg-background rounded-md border-border/60 group-hover:border-primary/60 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        >
                          <SelectValue placeholder="Select key" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="font-light">Musical Key</SelectLabel>
                            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <SparklesIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    </div>
                  </div>

                  {/* Status Select */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-light">
                      Status
                    </Label>
                    <div className="relative group">
                      <Select value={formData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger
                          className="h-10 pl-9 bg-background rounded-md border-border/60 group-hover:border-primary/60 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="font-light">Project Status</SelectLabel>
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="mixing">Mixing</SelectItem>
                            <SelectItem value="mastering">Mastering</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <QueueListIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    </div>
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-light">
                      Date
                    </Label>
                    <div className="relative group">
                      <Button
                        type="button"
                        role="combobox"
                        variant="outline"
                        className={cn(
                          'w-full h-10 pl-9 justify-start text-left bg-background',
                          'rounded-md border-border/60 font-light',
                          'group-hover:border-primary/60 hover:bg-accent/50',
                          'focus:border-primary focus:ring-1 focus:ring-primary/20',
                          'transition-all duration-200'
                        )}
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      >
                        <span>
                          {formData.dateCreated
                            ? format(new Date(formData.dateCreated), 'PPP')
                            : 'Pick a date'}
                        </span>
                      </Button>
                      <CalendarIcon className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                      
                      {isCalendarOpen && (
                        <div 
                          className={cn(
                            'absolute top-[calc(100%+4px)] left-0 w-auto z-[100]',
                            'bg-popover rounded-md border shadow-lg',
                            'animate-in fade-in-0 zoom-in-95'
                          )}
                        >
                          <Calendar
                            mode="single"
                            selected={new Date(formData.dateCreated)}
                            onSelect={(date) => {
                              handleDateChange(date)
                              setIsCalendarOpen(false)
                            }}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            className="bg-popover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Upload Section */}
              <div className="mt-8 space-y-2">
                <Label className="text-sm font-light">Audio File</Label>
                <div className="border border-border/60 hover:border-primary/60 rounded-md p-6 transition-all duration-200 group">
                  <AudioUploader onUploadComplete={handleAudioUpload} />
                  {audioUrl && (
                    <div className="mt-4 flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 px-2 rounded-md",
                          "bg-primary/10 hover:bg-primary/20",
                          "border-primary/20 hover:border-primary/30",
                          "text-primary",
                          "transition-all duration-200"
                        )}
                        onClick={handlePlayPause}
                        aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
                      >
                        {isPlaying ? (
                          <>
                            <PauseIcon className="h-4 w-4" />
                            <span className="sr-only">Pause audio</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4" />
                            <span className="sr-only">Play audio</span>
                          </>
                        )}
                      </Button>
                      <span className="text-sm text-muted-foreground font-light">{audioFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  className={cn(
                    'w-full h-10',
                    'bg-primary/90 hover:bg-primary',
                    'text-primary-foreground font-light tracking-wide',
                    'rounded-md shadow-lg',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'group'
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                      <span className="font-light">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="font-light">Create Project</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectDialog

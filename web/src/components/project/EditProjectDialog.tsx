import { useState, useEffect, useRef } from 'react'
import { Project } from '@/lib/types'
import { updateProject as updateProjectInStorage } from '@/lib/data'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Plus,
  Music,
  Tag,
  Info,
  Mic2,
  Activity,
  Hash,
  Key,
  FileText,
  Percent,
  Play,
  Pause,
  Loader2,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { AudioUploader } from '@/components/audio/AudioUploader'
import { analyzeAudioWithSpotify } from '@/lib/services/spotifyAnalysis'
import { cn } from '@/lib/utils'
import React from 'react'

interface EditProjectDialogProps {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated: (project: Project) => void
}

export default function EditProjectDialog({
  project,
  isOpen,
  onOpenChange,
  onProjectUpdated,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    genre: project.genre || '',
    bpm: project.bpm || '',
    key: project.key || '',
    status: project.status,
    completionPercentage: project.completionPercentage,
    audio_url: project.audio_url,
  })
  const [audioUrl, setAudioUrl] = useState<string | null>(project.audio_url)
  const [audioFileName, setAudioFileName] = useState<string | null>(project.audio_filename || null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Map status to completion percentage
  const statusToCompletion = {
    idea: 0,
    'in-progress': 25,
    mixing: 50,
    mastering: 75,
    completed: 100,
  }

  // Musical keys
  const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  // Update completion percentage when status changes
  useEffect(() => {
    if (formData.status in statusToCompletion) {
      const suggestedCompletion =
        statusToCompletion[formData.status as keyof typeof statusToCompletion]
      setFormData(prev => ({
        ...prev,
        completionPercentage: suggestedCompletion,
      }))
    }
  }, [formData.status, statusToCompletion])

  // Genre options
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as Project['status'],
      completionPercentage: statusToCompletion[value as Project['status']],
    }))
  }

  const handleGenreChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      genre: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required', {
        description: 'Please enter a title for your project.',
      })
      return
    }

    if (formData.bpm && (isNaN(Number(formData.bpm)) || Number(formData.bpm) < 0)) {
      toast.error('Invalid BPM', {
        description: 'BPM must be a positive number.',
      })
      return
    }

    try {
      // Submit the project
      const updatedProject = {
        ...project,
        ...formData,
        bpm: formData.bpm ? Number(formData.bpm) : undefined,
      }

      onProjectUpdated(updatedProject)
      onOpenChange(false)
      toast.success('Project updated', {
        description: `"${formData.title}" has been updated.`,
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project', {
        description: 'An error occurred while updating the project.',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4">
            {/* Title and Description */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="title" className="text-right text-sm font-medium">
                  Title
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                    <div className="p-1 rounded-md bg-violet-500/10">
                      <Music className="h-4 w-4 text-violet-500" />
                    </div>
                  </div>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-3">
                <Label htmlFor="description" className="text-right text-sm font-medium mt-1">
                  Description
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="h-20 text-sm"
                    placeholder="Enter project description"
                  />
                </div>
              </div>
            </div>

            {/* Genre */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="genre" className="text-right text-sm font-medium">
                Genre
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-pink-500/10">
                    <Tag className="h-4 w-4 text-pink-500" />
                  </div>
                </div>
                <Select value={formData.genre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Genre</SelectLabel>
                      {genreOptions.map(genre => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* BPM and Key */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="bpm" className="text-right text-sm font-medium">
                BPM
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-amber-500/10">
                    <Activity className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <Input
                  type="number"
                  id="bpm"
                  name="bpm"
                  value={formData.bpm}
                  onChange={handleChange}
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
                    <Key className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <Select value={formData.key} onValueChange={value => setFormData(prev => ({ ...prev, key: value }))}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Musical Key</SelectLabel>
                      {musicalKeys.map(key => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-indigo-500/10">
                    <FileText className="h-4 w-4 text-indigo-500" />
                  </div>
                </div>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Project Status</SelectLabel>
                      <SelectItem value="idea">
                        <span className="text-red-600 dark:text-red-400">Idea</span>
                      </SelectItem>
                      <SelectItem value="in-progress">
                        <span className="text-orange-600 dark:text-orange-400">In Progress</span>
                      </SelectItem>
                      <SelectItem value="mixing">
                        <span className="text-yellow-600 dark:text-yellow-400">Mixing</span>
                      </SelectItem>
                      <SelectItem value="mastering">
                        <span className="text-blue-600 dark:text-blue-400">Mastering</span>
                      </SelectItem>
                      <SelectItem value="completed">
                        <span className="text-green-600 dark:text-green-400">Completed</span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Completion Percentage */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="completion" className="text-right text-sm font-medium">
                Progress
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-end text-xs">
                  <span className="font-medium tabular-nums">
                    {formData.completionPercentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (formData.completionPercentage ?? 0) === 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : (formData.completionPercentage ?? 0) >= 75
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : (formData.completionPercentage ?? 0) >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                            : (formData.completionPercentage ?? 0) >= 25
                              ? 'bg-gradient-to-r from-orange-500 to-red-500'
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${formData.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Audio Upload Section */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label htmlFor="audio" className="text-right text-sm font-medium">
                Audio File
              </Label>
              <div className="col-span-3 space-y-2">
                <AudioUploader
                  onUploadComplete={handleAudioUpload}
                  projectId={project.id}
                  className="w-full"
                />
                
                {/* Audio Preview */}
                {audioUrl && (
                  <div className="relative p-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/10 border border-border/50 dark:border-border/30 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 overflow-hidden flex-1">
                        <div className="p-2 rounded-lg bg-background border border-border/50 dark:border-border/30 text-foreground group-hover:border-primary/50 dark:group-hover:border-primary/30 transition-colors shrink-0">
                          <Music className="h-5 w-5 animate-pulse-subtle" />
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="font-semibold text-foreground truncate" title={audioFileName || 'Audio file'}>
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
                          'w-12 h-12 rounded-full transition-all duration-300 shrink-0',
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
                          <Pause className="h-6 w-6 text-white drop-shadow-sm" />
                        ) : (
                          <Play className="h-6 w-6 ml-0.5 text-white drop-shadow-sm" />
                        )}
                      </button>
                    </div>
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
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

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

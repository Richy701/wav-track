import { useState, useEffect, useRef } from 'react'
import {
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
  MusicalNoteIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  BoltIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { updateProject } from '@/lib/data'
import { uploadCoverArt } from '@/lib/services/coverArt'
import { toast } from 'sonner'
import { useProjects } from '@/hooks/useProjects'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge'
import DeleteProjectDialog from '@/components/project/DeleteProjectDialog'
import EditProjectDialog from '@/components/project/EditProjectDialog'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface ProjectCardProps {
  project: Project
  onProjectUpdated: () => void
  onProjectDeleted: () => void
  onProjectSelect?: (project: Project) => void
  isSelected?: boolean
}

export default function ProjectCard({
  project,
  onProjectUpdated,
  onProjectDeleted,
  onProjectSelect,
  isSelected = false,
}: ProjectCardProps) {
  const { deleteProject, isDeletingProject } = useProjects()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showWaveform, setShowWaveform] = useState(false)
  const [localProject, setLocalProject] = useState(project)
  const [coverArtUrl, setCoverArtUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Global state to track which card is currently playing
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null)

  const statusToCompletion = {
    idea: 0,
    'in-progress': 25,
    mixing: 50,
    mastering: 75,
    completed: 100,
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(dateString)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleMoveToNextStage = () => {
    const statusOrder: Project['status'][] = [
      'idea',
      'in-progress',
      'mixing',
      'mastering',
      'completed',
    ]
    const currentIndex = statusOrder.indexOf(localProject.status)

    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1]
      const updatedProject = {
        ...localProject,
        status: nextStatus,
        completionPercentage: statusToCompletion[nextStatus],
        lastModified: new Date().toISOString(),
      }

      try {
        updateProject(updatedProject)
        setLocalProject(updatedProject)
        onProjectUpdated()
        setMenuOpen(false)

        toast.success('Project status updated', {
          description: `"${updatedProject.title}" moved to ${nextStatus.replace('-', ' ')}.`,
        })
      } catch (error) {
        console.error('Error updating project status:', error)
        toast.error('Failed to update status', {
          description: 'An error occurred while updating the project status.',
        })
      }
    }
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    try {
      updateProject(updatedProject)
      setLocalProject(updatedProject)
      onProjectUpdated()
      setIsEditDialogOpen(false)

      toast.success('Project updated', {
        description: `"${updatedProject.title}" has been updated.`,
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project', {
        description: 'An error occurred while updating the project.',
      })
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or menu
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('button') || e.target.closest('[role="menuitem"]'))
    ) {
      return
    }
    onProjectSelect?.(project)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    setIsEditDialogOpen(true)
    setMenuOpen(false) // Close the menu
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    setIsDeleteDialogOpen(true)
    setMenuOpen(false) // Close the menu
  }

  // Debug log for audio URL
  useEffect(() => {
    console.log(`Project "${project.title}" audio URL:`, {
      url: project.audio_url,
      exists: Boolean(project.audio_url),
      type: typeof project.audio_url
    })
  }, [project.audio_url, project.title])

  // Initialize audio element when component mounts
  useEffect(() => {
    if (project.audio_url?.trim()) {
      const audio = new Audio(project.audio_url)
      audioRef.current = audio

      // Add event listeners
      audio.addEventListener('ended', () => setIsPlaying(false))
      audio.addEventListener('pause', () => setIsPlaying(false))
      audio.addEventListener('play', () => setIsPlaying(true))
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e)
        setAudioError('Failed to load audio file')
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
  }, [project.audio_url])

  // Handle audio playback
  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Prevent card click

    // Get the audio URL from the project
    const audioUrl = project.audio_url
    
    // Enhanced audio URL validation with detailed logging
    console.log('Play button clicked:', {
      projectTitle: project.title,
      audioUrl,
      audioUrlType: typeof audioUrl,
      audioUrlLength: audioUrl?.length,
      hasAudio: Boolean(audioUrl?.trim()),
      project: {
        id: project.id,
        title: project.title,
        audio_url: project.audio_url,
        status: project.status
      }
    })

    // Check if audio URL exists and is not empty
    if (!audioUrl?.trim()) {
      console.warn('No audio URL found for project:', project.title)
      toast.error('No audio available', {
        description: 'This project does not have any audio attached.',
      })
      return
    }

    if (!audioRef.current) {
      console.warn('Audio element not initialized')
      return
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Pause all other audio elements first
      document.querySelectorAll('audio').forEach(audio => {
        if (audio !== audioRef.current) {
          audio.pause()
        }
      })
      
      // Add error handling for play attempt
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

  return (
    <div className="project-card-container">
      <div
        className={cn(
          'group relative bg-card rounded-xl overflow-hidden w-full',
          isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow hover:shadow-md',
          'border border-border/50 hover:border-primary/20',
          isSelected && 'ring-2 ring-primary'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
      >
        <div className="flex">
          {/* Left side play button container */}
          <div className="p-4 sm:p-5">
            {/* Audio Play/Pause Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
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
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? 'Pause audio preview' : 'Play audio preview'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-7 w-7 text-white drop-shadow-md" />
                    ) : (
                      <PlayIcon className="h-7 w-7 ml-0.5 text-white drop-shadow-md" />
                    )}
                    <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? 'Pause Preview' : 'Play Preview'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Main content */}
          <div className="flex-1 py-4 pr-4 pl-2 sm:py-5 sm:pr-5 sm:pl-3 flex flex-col justify-between">
            {/* Top section with status and menu */}
            <div className="flex justify-between items-start gap-2 min-w-0 mb-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    localProject.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                      : localProject.status === 'mastering'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                        : localProject.status === 'mixing'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                          : localProject.status === 'in-progress'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                  }`}
                >
                  {localProject.status.replace('-', ' ')}
                </div>
                <div className="text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
                  {localProject.completionPercentage}%
                </div>
              </div>

              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleEditClick} className="gap-2">
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="gap-2 text-destructive">
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Middle section with title and metadata */}
            <div className="space-y-2 min-w-0 mb-3">
              <Link
                to={`/project/${project.id}`}
                className="block hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-medium tracking-tight line-clamp-1 break-words">
                  {localProject.title}
                </h3>
              </Link>
              
              {/* Project metadata with improved layout */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{formatDate(localProject.dateCreated)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                  <MusicalNoteIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{localProject.bpm} BPM</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                  <MusicalNoteIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{localProject.key}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                  <ArrowPathIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Updated {formatTimeAgo(localProject.lastModified)}</span>
                </div>
              </div>

              {/* Project tags with improved styling */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {project.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="px-2 py-0.5 rounded-full text-xs bg-primary/5 text-primary border border-primary/10"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom section with status bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">
                  {localProject.completionPercentage}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (localProject.completionPercentage ?? 0) === 100
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : (localProject.completionPercentage ?? 0) >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : (localProject.completionPercentage ?? 0) >= 50
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : (localProject.completionPercentage ?? 0) >= 25
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${localProject.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditProjectDialog
        project={localProject}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProjectUpdated={handleProjectUpdated}
      />
      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={onProjectDeleted}
      />
    </div>
  )
}


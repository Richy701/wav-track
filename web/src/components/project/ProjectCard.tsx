import { useState, useEffect, useRef } from 'react'
import {
  ArrowClockwise,
  Calendar,
  CheckCircle,
  DotsThreeVertical,
  MusicNote,
  PencilSimple,
  Trash,
  Waveform,
  Lightning,
  Play,
  Pause,
} from '@phosphor-icons/react'
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
import { Sparkles } from 'lucide-react'
import React from 'react'
import { motion } from 'framer-motion'

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

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      'idea': 'text-blue-500 dark:text-blue-400',
      'in-progress': 'text-yellow-500 dark:text-yellow-400',
      'mixing': 'text-purple-500 dark:text-purple-400',
      'mastering': 'text-orange-500 dark:text-orange-400',
      'completed': 'text-green-500 dark:text-green-400',
    }
    return colors[status] || 'text-gray-500 dark:text-gray-400'
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'idea':
        return <Sparkles className={cn('w-5 h-5', getStatusColor(status))} />
      case 'in-progress':
        return <Waveform className={cn('w-5 h-5', getStatusColor(status))} />
      case 'mixing':
        return <MusicNote className={cn('w-5 h-5', getStatusColor(status))} />
      case 'mastering':
        return <Lightning className={cn('w-5 h-5', getStatusColor(status))} />
      case 'completed':
        return <CheckCircle className={cn('w-5 h-5', getStatusColor(status))} />
      default:
        return <MusicNote className={cn('w-5 h-5', getStatusColor(status))} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]',
        'dark:border-gray-800 dark:bg-gray-900/50 dark:hover:bg-gray-900',
        isSelected && 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
      )}
      onClick={handleCardClick}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(localProject.status)}
              <h3 className="font-semibold text-lg leading-none tracking-tight">
                {localProject.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {localProject.description || 'No description'}
            </p>
          </div>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <DotsThreeVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleEditClick}>
                <PencilSimple className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveToNextStage}>
                <ArrowClockwise className="mr-2 h-4 w-4" />
                Next Stage
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{localProject.completionPercentage}%</span>
          </div>
          <Progress
            value={localProject.completionPercentage}
            className="h-2"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatTimeAgo(localProject.lastModified)}</span>
          </div>
          <ProjectStatusBadge status={localProject.status} />
        </div>
      </div>

      <EditProjectDialog
        project={localProject}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProjectUpdated={handleProjectUpdated}
      />

      <DeleteProjectDialog
        project={localProject}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onProjectDeleted={handleDelete}
      />
    </motion.div>
  )
}


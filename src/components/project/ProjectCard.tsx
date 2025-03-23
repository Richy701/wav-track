import { useState, useRef, useEffect } from 'react'
import {
  ArrowClockwise,
  Calendar,
  CheckCircle,
  DotsThreeVertical,
  MusicNote,
  Pause,
  PencilSimple,
  Play,
  SpeakerHigh,
  Trash,
  Waveform,
  Lightning,
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [showWaveform, setShowWaveform] = useState(false)
  const [localProject, setLocalProject] = useState(project)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [coverArtUrl, setCoverArtUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
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

  return (
    <div className="project-card-container">
      <Link
        to={`/project/${project.id}`}
        onClick={e => {
          if (
            e.target instanceof HTMLElement &&
            (e.target.closest('button') || e.target.closest('[role="menuitem"]'))
          ) {
            e.preventDefault()
          }
        }}
      >
        <div
          className={cn(
            'group relative bg-card rounded-xl overflow-hidden transition-all duration-300 cursor-pointer w-full',
            isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow hover:shadow-md',
            'border border-border/50 hover:border-primary/20',
            isSelected && 'ring-2 ring-primary'
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          aria-pressed="false"
        >
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    localProject.status === 'completed'
                      ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                      : localProject.status === 'mastering'
                        ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                        : localProject.status === 'mixing'
                          ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                          : localProject.status === 'in-progress'
                            ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                            : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                  }`}
                >
                  {localProject.status.replace('-', ' ')}
                </div>
                <div className="text-xs font-medium tabular-nums text-muted-foreground">
                  {localProject.completionPercentage}%
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <DotsThreeVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleEditClick} className="gap-2">
                    <PencilSimple className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="gap-2 text-destructive">
                    <Trash className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-medium tracking-tight line-clamp-1">
                {localProject.title}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(localProject.dateCreated)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MusicNote className="h-3.5 w-3.5" />
                  <span>{localProject.bpm} BPM</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MusicNote className="h-3.5 w-3.5" />
                  <span>{localProject.key}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <ArrowClockwise className="h-3.5 w-3.5" />
                  <span>Updated {formatTimeAgo(localProject.lastModified)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">
                  {localProject.completionPercentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    localProject.completionPercentage === 100
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : localProject.completionPercentage >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : localProject.completionPercentage >= 50
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : localProject.completionPercentage >= 25
                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${localProject.completionPercentage}%` }}
                />
              </div>
            </div>

            {showWaveform && localProject.audioFile && (
              <div className="pt-3 border-t border-border/50">
                <div className="bg-muted/50 rounded-lg p-3 relative overflow-hidden">
                  <div className="flex justify-center">
                    <Lightning className="h-5 w-5 text-primary animate-pulse" weight="fill" />
                  </div>
                  <div className="text-xs text-center text-muted-foreground mt-1">
                    Waveform visualization coming soon
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Audio Element */}
      {project.audioFile && (
        <audio
          ref={audioRef}
          src={project.audioFile.url}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

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

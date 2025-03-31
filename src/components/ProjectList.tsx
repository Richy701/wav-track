import React, { useState, useEffect, useMemo } from 'react'
import { Trash, ArrowsDownUp, Clock, ArrowsVertical, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { clearAllProjects } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ProjectCard from '@/components/project/ProjectCard'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { SortableProjectCard } from '@/components/project/SortableProjectCard'
import { Loading } from '@/components/ui/loading'
import { useQueryClient } from '@tanstack/react-query'
import { EmptyState } from './EmptyState'

interface ProjectListProps {
  title?: string
  projectList?: Project[]
  isLoading?: boolean
  onDragEnd?: (activeId: string, overId: string) => void
  onProjectSelect?: (project: Project | null) => void
}

type SortOption = 'newest' | 'oldest' | 'name' | 'completion'

const ProjectList: React.FC<ProjectListProps> = ({
  title = 'Recent Projects',
  projectList = [],
  isLoading = false,
  onDragEnd,
  onProjectSelect,
}) => {
  const queryClient = useQueryClient()
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false)
  const { 
    projects, 
    allProjects, 
    isLoading: isProjectsLoading, 
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
    projectsPerPage
  } = useProjects()
  const [filter, setFilter] = useState<Project['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && onDragEnd) {
      onDragEnd(active.id as string, over.id as string)
    }
  }

  const handleClearAllProjects = async () => {
    try {
      await clearAllProjects()
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsClearDialogOpen(false)
      toast.success('All data cleared', {
        description: "You're starting fresh.",
      })
    } catch (error) {
      console.error('Error clearing projects:', error)
      toast.error('Failed to clear projects', {
        description: 'An error occurred while clearing projects.',
      })
    }
  }

  const handleProjectUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  const handleProjectDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    if (selectedProjectId) {
      setSelectedProjectId(null)
      onProjectSelect?.(null)
    }
  }

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProjectId(selectedProjectId === project.id ? null : project.id)
    onProjectSelect?.(selectedProjectId === project.id ? null : project)
  }

  // Handle loading more projects
  const handleLoadMore = async () => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    try {
      await loadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }

  const statuses: { value: Project['status'] | 'all'; label: string; className?: string }[] = [
    { value: 'all', label: 'All', className: 'bg-zinc-500/20 text-zinc-100' },
    { value: 'idea', label: 'Ideas', className: 'bg-blue-500/20 text-blue-500 dark:text-blue-400' },
    {
      value: 'in-progress',
      label: 'In Progress',
      className: 'bg-amber-500/20 text-amber-500 dark:text-amber-400',
    },
    {
      value: 'mixing',
      label: 'Mixing',
      className: 'bg-purple-500/20 text-purple-500 dark:text-purple-400',
    },
    {
      value: 'mastering',
      label: 'Mastering',
      className: 'bg-violet-500/20 text-violet-500 dark:text-violet-400',
    },
    {
      value: 'completed',
      label: 'Completed',
      className: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    },
  ]

  // Apply both filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    // First filter
    const filtered =
      filter === 'all' ? projects : projects.filter(project => project.status === filter)

    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        case 'oldest':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
        case 'name':
          return a.title.localeCompare(b.title)
        case 'completion':
          return b.completionPercentage - a.completionPercentage
        default:
          return 0
      }
    })
  }, [projects, filter, sortBy])

  // Get the appropriate icon and text for the current sort option
  const getSortOptionDisplay = (option: SortOption) => {
    switch (option) {
      case 'newest':
        return { icon: <Clock size={16} weight="bold" />, text: 'Newest First' }
      case 'oldest':
        return { icon: <Clock size={16} weight="bold" />, text: 'Oldest First' }
      case 'name':
        return { icon: <ArrowsDownUp size={16} weight="bold" />, text: 'Name (A-Z)' }
      case 'completion':
        return {
          icon: <ArrowsVertical size={16} weight="bold" className="transform rotate-180" />,
          text: 'Completion (High-Low)',
        }
    }
  }

  const currentSortDisplay = getSortOptionDisplay(sortBy)

  // Auto-correct current page if it's beyond the total pages
  useEffect(() => {
    if (projects.length > 0 && currentPage > totalPages) {
      handlePageChange(totalPages)
    }
  }, [projects, currentPage, totalPages, handlePageChange])

  if (isProjectsLoading) {
    return <Loading />
  }

  if (projects.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">Track and manage your production work</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-card rounded-lg p-1 flex shadow-sm">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  filter === status.value
                    ? status.className
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {status.label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {currentSortDisplay.icon}
                {currentSortDisplay.text}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                <Clock className="mr-2 h-4 w-4" weight="bold" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                <Clock className="mr-2 h-4 w-4" weight="bold" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                <ArrowsDownUp className="mr-2 h-4 w-4" weight="bold" />
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('completion')}>
                <ArrowsVertical className="mr-2 h-4 w-4" weight="bold" />
                Completion (High-Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsClearDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredAndSortedProjects.map(project => project.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[700px]">
            {filteredAndSortedProjects.map(project => (
              <SortableProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProjectId === project.id}
                onSelect={handleProjectSelect}
                onUpdate={handleProjectUpdated}
                onDelete={handleProjectDeleted}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination Controls */}
      {projects.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mt-12 mb-20 space-y-3"
        >
          <p className="text-sm text-zinc-400">Showing all {projects.length} projects</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoadingMore}
              className={cn(
                "px-4 py-2 rounded-full border border-zinc-700 text-zinc-400",
                "hover:bg-zinc-800 transition",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                disabled={isLoadingMore}
                className={cn(
                  "w-10 h-10 rounded-full font-semibold transition",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  currentPage === i + 1
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "text-zinc-300 hover:bg-zinc-800"
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoadingMore}
              className={cn(
                "px-4 py-2 rounded-full border border-zinc-700 text-zinc-400",
                "hover:bg-zinc-800 transition",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              Next →
            </button>
          </div>
        </motion.div>
      )}

      {/* Clear All Projects Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">⚠️ Clear All Projects and Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete everything? This will permanently erase all your projects, beats, sessions, and achievement progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllProjects}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProjectList

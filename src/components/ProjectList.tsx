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
import { getStatusClasses } from '@/lib/constants/colors'
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
import { FilterBar } from '@/components/ui/filter-bar'

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
  const [filter, setFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "status">("newest")
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
      // Optimistically update the UI
      queryClient.setQueryData(['projects'], [])
      queryClient.setQueryData(['stats'], {
        totalProjects: 0,
        completedProjects: 0,
        completionRate: 0,
        productivityScore: 0
      })
      
      // Close the dialog immediately for better UX
      setIsClearDialogOpen(false)
      
      // Show loading toast
      const loadingToast = toast.loading('Clearing all data...')
      
      // Perform the actual deletion
      await clearAllProjects()
      
      // Invalidate all relevant queries in parallel
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['beatActivities'] }),
        queryClient.invalidateQueries({ queryKey: ['achievements'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] })
      ])
      
      // Update toast to success
      toast.dismiss(loadingToast)
      toast.success('All data cleared', {
        description: "You're starting fresh.",
      })
    } catch (error) {
      console.error('Error clearing projects:', error)
      // Revert optimistic updates on error
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
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
    { value: 'all', label: 'All', className: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400' },
    { value: 'idea', label: 'Ideas', className: getStatusClasses('idea') },
    { value: 'in-progress', label: 'In Progress', className: getStatusClasses('in-progress') },
    { value: 'mixing', label: 'Mixing', className: getStatusClasses('mixing') },
    { value: 'mastering', label: 'Mastering', className: getStatusClasses('mastering') },
    { value: 'completed', label: 'Completed', className: getStatusClasses('completed') },
  ]

  // Apply both filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    // First filter - map display names to actual status values
    const getStatusValue = (filterValue: string) => {
      switch (filterValue) {
        case 'Ideas': return 'idea'
        case 'In Progress': return 'in-progress'
        case 'Mixing': return 'mixing'
        case 'Mastering': return 'mastering'
        case 'Completed': return 'completed'
        default: return filterValue.toLowerCase()
      }
    }

    const filtered = filter === 'All' 
      ? projects 
      : projects.filter(project => project.status === getStatusValue(filter))

    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        case 'oldest':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
        case 'name':
          return a.title.localeCompare(b.title)
        case 'status':
          return (b.completionPercentage || 0) - (a.completionPercentage || 0)
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

        <FilterBar
          status={filter}
          onStatusChange={setFilter}
          sortOrder={sortBy}
          onSortChange={setSortBy}
          onDelete={() => setIsClearDialogOpen(true)}
        />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

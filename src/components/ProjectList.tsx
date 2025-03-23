import React, { useState, useEffect, useMemo } from 'react'
import { Trash, ArrowsDownUp, Clock, ArrowsVertical } from '@phosphor-icons/react'
import { clearAllProjects } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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
  onDragEnd?: (activeId: string, overId: string) => void
  onProjectSelect?: (project: Project | null) => void
}

type SortOption = 'newest' | 'oldest' | 'name' | 'completion'

const ProjectList: React.FC<ProjectListProps> = ({
  title = 'Recent Projects',
  onDragEnd,
  onProjectSelect,
}) => {
  const queryClient = useQueryClient()
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false)
  const { projects, isLoading, isFetching, error } = useProjects()
  const [filter, setFilter] = useState<Project['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

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
      toast.success('All projects deleted', {
        description: 'Your project list has been cleared.',
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

  if (isLoading) {
    return <div>Loading...</div>
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
            className="gap-2"
            onClick={() => setIsClearDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Error loading projects. Please try again later.
          </p>
        </div>
      ) : null}

      <Loading
        isLoading={isLoading}
        timeout={10000}
        onTimeout={() => {
          toast.error('Loading is taking longer than expected', {
            description: 'Please check your connection and try again.',
          })
        }}
      />

      {!isLoading && filteredAndSortedProjects.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No projects found.</p>
          {filter !== 'all' && (
            <p className="mt-2 text-sm text-muted-foreground">
              Try changing your filter or creating a new project.
            </p>
          )}
        </div>
      ) : null}

      {!isLoading && filteredAndSortedProjects.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="relative">
            {isFetching && !isLoading ? (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
                <Loading
                  isLoading={true}
                  loadingText="Refreshing..."
                  className="bg-background/95 shadow-lg rounded-lg"
                />
              </div>
            ) : null}
            <SortableContext
              items={filteredAndSortedProjects.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-hidden">
                {filteredAndSortedProjects.map(project => (
                  <SortableProjectCard
                    key={project.id}
                    project={project}
                    onProjectUpdated={handleProjectUpdated}
                    onProjectDeleted={handleProjectDeleted}
                    onProjectSelect={handleProjectSelect}
                    isSelected={selectedProjectId === project.id}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </DndContext>
      ) : null}

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Projects</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all projects? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllProjects}>Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProjectList

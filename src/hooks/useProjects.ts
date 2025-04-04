import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, addProject, updateProject, deleteProject } from '../lib/data'
import { Project } from '../lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState, useCallback, useMemo } from 'react'

// Query keys for React Query
const QUERY_KEYS = {
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
  beatActivities: ['beatActivities'] as const,
  stats: ['stats'] as const,
}

// Helper function to safely parse date
const safeParseDate = (dateString: string | undefined): number => {
  if (!dateString) return 0
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? 0 : date.getTime()
  } catch {
    return 0
  }
}

// Helper function to sort projects by last_modified
const sortProjects = (projects: Project[]) => {
  return [...projects].sort((a, b) => {
    const bTime = safeParseDate(b.last_modified)
    const aTime = safeParseDate(a.last_modified)
    return bTime - aTime
  })
}

export function useProjects(projectsPerPage: number = 9) {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()
  const [isRefetching, setIsRefetching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Always call useQuery, but disable it when there's no user
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => getProjects(user?.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Calculate paginated projects
  const paginatedProjects = useMemo(() => 
    projects.slice(
      (currentPage - 1) * projectsPerPage,
      currentPage * projectsPerPage
    ),
    [projects, currentPage, projectsPerPage]
  )

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(projects.length / projectsPerPage),
    [projects.length, projectsPerPage]
  )

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }, [totalPages])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: addProject,
    onMutate: async newProject => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.beatActivities }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.stats }),
      ])

      // Snapshot the previous values
      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])
      const previousStats = queryClient.getQueryData(QUERY_KEYS.stats)
      const previousActivities = queryClient.getQueryData(QUERY_KEYS.beatActivities)

      // Generate a temporary ID for the new project
      const tempId = crypto.randomUUID()

      // Optimistically update projects
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        const optimisticProject = { 
          ...newProject, 
          id: tempId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return sortProjects([optimisticProject, ...old])
      })

      // Reset to first page when adding new project
      setCurrentPage(1)

      return { 
        previousProjects,
        previousStats,
        previousActivities,
        tempId,
      }
    },
    onError: (err, newProject, context) => {
      if (context) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context.previousProjects)
        queryClient.setQueryData(QUERY_KEYS.stats, context.previousStats)
        queryClient.setQueryData(QUERY_KEYS.beatActivities, context.previousActivities)
      }
      console.error('Failed to add project:', err)
    },
    onSuccess: (createdProject, variables, context) => {
      if (context?.tempId) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
          return old.map(project => 
            project.id === context.tempId ? { ...project, id: createdProject.id } : project
          )
        })
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.beatActivities }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
        refreshProfile(),
      ])
    },
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onMutate: async updatedProject => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.stats }),
      ])

      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])
      const previousStats = queryClient.getQueryData(QUERY_KEYS.stats)

      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        const updatedProjects = old.map(project =>
          project.id === updatedProject.id 
            ? { 
                ...project, 
                ...updatedProject,
                updated_at: new Date().toISOString(),
              } 
            : project
        )
        return sortProjects(updatedProjects)
      })

      return { previousProjects, previousStats }
    },
    onError: (err, updatedProject, context) => {
      if (context) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context.previousProjects)
        queryClient.setQueryData(QUERY_KEYS.stats, context.previousStats)
      }
      console.error('Failed to update project:', err)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
        refreshProfile(),
      ])
    },
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: async projectId => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.stats }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.beatActivities }),
        queryClient.cancelQueries({ queryKey: ['achievements'] }),
        queryClient.cancelQueries({ queryKey: ['profile'] }),
      ])

      // Snapshot the previous values
      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])
      const previousStats = queryClient.getQueryData(QUERY_KEYS.stats)
      const previousActivities = queryClient.getQueryData(QUERY_KEYS.beatActivities)
      const previousAchievements = queryClient.getQueryData(['achievements'])
      const previousProfile = queryClient.getQueryData(['profile'])

      // Optimistically update projects
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        return old.filter(project => project.id !== projectId)
      })

      // Optimistically update stats
      queryClient.setQueryData(QUERY_KEYS.stats, (old: any) => {
        if (!old) return old
        const totalProjects = (old.totalProjects || 1) - 1
        const completedProjects = old.completedProjects
        const completionRate = totalProjects > 0 
          ? Math.round((completedProjects / totalProjects) * 100) 
          : 0
        return {
          ...old,
          totalProjects,
          completionRate
        }
      })

      return { 
        previousProjects, 
        previousStats, 
        previousActivities,
        previousAchievements,
        previousProfile
      }
    },
    onError: (err, projectId, context) => {
      if (context) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context.previousProjects)
        queryClient.setQueryData(QUERY_KEYS.stats, context.previousStats)
        queryClient.setQueryData(QUERY_KEYS.beatActivities, context.previousActivities)
        queryClient.setQueryData(['achievements'], context.previousAchievements)
        queryClient.setQueryData(['profile'], context.previousProfile)
      }
      console.error('Failed to delete project:', err)
    },
    onSettled: async () => {
      // Invalidate queries in parallel
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.beatActivities }),
        queryClient.invalidateQueries({ queryKey: ['achievements'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        refreshProfile(),
      ])
    },
  })

  // Refetch effect
  useEffect(() => {
    if (!user?.id) return

    const abortController = new AbortController()
    
    if (isRefetching) {
      refetch()
        .finally(() => setIsRefetching(false))
    }

    return () => {
      abortController.abort()
    }
  }, [user?.id, isRefetching, refetch])

  const triggerRefetch = useCallback(() => {
    setIsRefetching(true)
  }, [])

  return {
    projects: paginatedProjects,
    allProjects: projects,
    isLoading,
    error,
    refetch: triggerRefetch,
    addProject: addProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutate,
    isAddingProject: addProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
    currentPage,
    setCurrentPage,
    totalPages,
    projectsPerPage,
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
  }
}

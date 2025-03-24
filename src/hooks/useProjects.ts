import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, addProject, updateProject, deleteProject } from '../lib/data'
import { Project } from '../lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

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

export function useProjects() {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()

  // Fetch projects with optimized caching
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [...QUERY_KEYS.projects, user?.id],
    queryFn: getProjects,
    select: sortProjects,
    enabled: !!user,
    staleTime: 1000 * 30, // Consider data stale after 30 seconds
    cacheTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    gcTime: 0,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Add effect to invalidate queries when user changes
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ 
        queryKey: [...QUERY_KEYS.projects, user.id],
        exact: true
      })
    }
  }, [user?.id, queryClient])

  // Add project with optimistic updates
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

      // Return context with snapshotted values
      return { 
        previousProjects,
        previousStats,
        previousActivities,
        tempId,
      }
    },
    onError: (err, newProject, context) => {
      // Roll back all optimistic updates
      if (context) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context.previousProjects)
        queryClient.setQueryData(QUERY_KEYS.stats, context.previousStats)
        queryClient.setQueryData(QUERY_KEYS.beatActivities, context.previousActivities)
      }
      console.error('Failed to add project:', err)
    },
    onSuccess: (createdProject, variables, context) => {
      // Update the temporary ID with the real one
      if (context?.tempId) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
          return old.map(project => 
            project.id === context.tempId ? { ...project, id: createdProject.id } : project
          )
        })
      }
    },
    onSettled: async () => {
      // Refetch in the background to ensure cache consistency
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.beatActivities }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
        refreshProfile(),
      ])
    },
  })

  // Update project with optimistic updates
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

  // Delete project with optimistic updates
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: async projectId => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.stats }),
        queryClient.cancelQueries({ queryKey: QUERY_KEYS.beatActivities }),
      ])

      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])
      const previousStats = queryClient.getQueryData(QUERY_KEYS.stats)
      const previousActivities = queryClient.getQueryData(QUERY_KEYS.beatActivities)

      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        return old.filter(project => project.id !== projectId)
      })

      return { previousProjects, previousStats, previousActivities }
    },
    onError: (err, projectId, context) => {
      if (context) {
        queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context.previousProjects)
        queryClient.setQueryData(QUERY_KEYS.stats, context.previousStats)
        queryClient.setQueryData(QUERY_KEYS.beatActivities, context.previousActivities)
      }
      console.error('Failed to delete project:', err)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.beatActivities }),
        refreshProfile(),
      ])
    },
  })

  return {
    projects,
    isLoading,
    isError,
    error,
    isFetching,
    addProject: addProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutate,
    isAddingProject: addProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  }
}

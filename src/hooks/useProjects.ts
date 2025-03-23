import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, addProject, updateProject, deleteProject } from '../lib/data'
import { Project } from '../lib/types'
import { useAuth } from '@/contexts/AuthContext'

// Query keys for React Query
const QUERY_KEYS = {
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
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
  })

  // Add project with optimistic updates
  const addProjectMutation = useMutation({
    mutationFn: addProject,
    onMutate: async newProject => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] })

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])

      // Optimistically update to the new value with proper sorting
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        const updatedProjects = [{ ...newProject, id: crypto.randomUUID() }, ...old]
        return sortProjects(updatedProjects)
      })

      // Return a context object with the snapshotted value
      return { previousProjects }
    },
    onError: (err, newProject, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context?.previousProjects)
      console.error('Failed to add project:', err)
    },
    onSettled: async () => {
      // Always refetch after error or success to ensure cache synchronization
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] })
      // Refresh profile data to update stats
      await refreshProfile()
    },
  })

  // Update project with optimistic updates
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onMutate: async updatedProject => {
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] })
      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])

      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        const updatedProjects = old.map(project =>
          project.id === updatedProject.id ? { ...project, ...updatedProject } : project
        )
        return sortProjects(updatedProjects)
      })

      return { previousProjects }
    },
    onError: (err, updatedProject, context) => {
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context?.previousProjects)
      console.error('Failed to update project:', err)
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] })
      // Refresh profile data to update stats
      await refreshProfile()
    },
  })

  // Delete project with optimistic updates
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: async projectId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] })

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData([...QUERY_KEYS.projects, user?.id])

      // Optimistically update to the new value
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], (old: Project[] = []) => {
        return old.filter(project => project.id !== projectId)
      })

      // Return a context object with the snapshotted value
      return { previousProjects }
    },
    onError: (err, projectId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData([...QUERY_KEYS.projects, user?.id], context?.previousProjects)
      console.error('Failed to delete project:', err)
    },
    onSettled: async () => {
      // Always refetch after error or success to ensure cache synchronization
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.projects, user?.id] })
      // Refresh profile data to update stats
      await refreshProfile()
    },
  })

  return {
    projects,
    isLoading,
    isError,
    error,
    isFetching,
    addProject: addProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isAddingProject: addProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  }
}

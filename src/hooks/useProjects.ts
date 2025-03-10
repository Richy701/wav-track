import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, addProject, updateProject, deleteProject } from '../lib/data';
import { Project } from '../lib/types';

// Query keys for React Query
const QUERY_KEYS = {
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
};

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch projects with optimized caching
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: getProjects,
    select: (data) => data.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    ),
  });

  // Add project with optimistic updates
  const addProjectMutation = useMutation({
    mutationFn: addProject,
    onMutate: async (newProject) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.projects });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(QUERY_KEYS.projects);

      // Optimistically update to the new value
      queryClient.setQueryData(QUERY_KEYS.projects, (old: Project[] = []) => [newProject, ...old]);

      // Return a context object with the snapshotted value
      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(QUERY_KEYS.projects, context?.previousProjects);
      console.error('Failed to add project:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache synchronization
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });

  // Update project with optimistic updates
  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onMutate: async (updatedProject) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.projects });
      const previousProjects = queryClient.getQueryData(QUERY_KEYS.projects);

      queryClient.setQueryData(QUERY_KEYS.projects, (old: Project[] = []) =>
        old.map((project) =>
          project.id === updatedProject.id ? { ...project, ...updatedProject } : project
        )
      );

      return { previousProjects };
    },
    onError: (err, updatedProject, context) => {
      queryClient.setQueryData(QUERY_KEYS.projects, context?.previousProjects);
      console.error('Failed to update project:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });

  // Delete project with optimistic updates
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.projects });
      const previousProjects = queryClient.getQueryData(QUERY_KEYS.projects);

      queryClient.setQueryData(QUERY_KEYS.projects, (old: Project[] = []) =>
        old.filter((project) => project.id !== projectId)
      );

      return { previousProjects };
    },
    onError: (err, projectId, context) => {
      queryClient.setQueryData(QUERY_KEYS.projects, context?.previousProjects);
      console.error('Failed to delete project:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });

  return {
    projects,
    isLoading,
    isError,
    error,
    isFetching,
    addProject: addProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isAddingProject: addProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  };
}

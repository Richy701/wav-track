
import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock API functions - in a real app, these would connect to your backend
const fetchProjects = async (): Promise<Project[]> => {
  // For demo, retrieving from localStorage
  const storedProjects = localStorage.getItem('projects');
  return storedProjects ? JSON.parse(storedProjects) : [];
};

const createProject = async (project: Project): Promise<Project> => {
  const projects = await fetchProjects();
  const newProjects = [...projects, project];
  localStorage.setItem('projects', JSON.stringify(newProjects));
  return project;
};

const updateProject = async (project: Project): Promise<Project> => {
  const projects = await fetchProjects();
  const updatedProjects = projects.map(p => 
    p.id === project.id ? project : p
  );
  localStorage.setItem('projects', JSON.stringify(updatedProjects));
  return project;
};

const deleteProject = async (id: string): Promise<string> => {
  const projects = await fetchProjects();
  const filteredProjects = projects.filter(p => p.id !== id);
  localStorage.setItem('projects', JSON.stringify(filteredProjects));
  return id;
};

export function useProjects() {
  const queryClient = useQueryClient();

  // Fetch projects
  const { 
    data: projects = [], 
    isLoading, 
    isError,
    error,
    isFetching
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  // Add project mutation
  const { mutate: addProject, isPending: isAddingProject } = useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  // Update project mutation
  const { mutate: updateProjectMutation, isPending: isUpdatingProject } = useMutation({
    mutationFn: updateProject,
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  // Delete project mutation
  const { mutate: deleteProjectMutation, isPending: isDeletingProject } = useMutation({
    mutationFn: deleteProject,
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  return {
    projects,
    isLoading,
    isError,
    error,
    isFetching,
    addProject,
    isAddingProject,
    updateProject: updateProjectMutation,
    isUpdatingProject,
    deleteProject: deleteProjectMutation,
    isDeletingProject
  };
}

import { useState, useEffect } from 'react';
import { getProjects } from '@/lib/data';
import type { Project } from '@/lib/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Try to load from localStorage first
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      try {
        return JSON.parse(storedProjects);
      } catch (error) {
        console.error('Error parsing stored projects:', error);
      }
    }
    
    // If no stored projects or error, use initial projects
    return getProjects();
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  }, [projects]);

  // Load projects from storage on mount and when needed
  const refreshProjects = () => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
  };

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        // Load projects from storage
        const loadedProjects = getProjects();
        if (mounted) {
          setProjects(loadedProjects);
        }
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load projects'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    projects,
    isLoading,
    error,
    setProjects,
    refreshProjects,
  };
}

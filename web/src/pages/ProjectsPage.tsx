import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'
import { useProjects } from '@/hooks/useProjects'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProjectCard from '@/components/project/ProjectCard'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProjectsPage() {
  const { projects, isLoading, error } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const navigate = useNavigate()

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    navigate(`/project/${project.id}`)
  }

  const handleProjectUpdated = () => {
    // Refresh projects list
    // This will be handled by the useProjects hook
  }

  const handleProjectDeleted = () => {
    // Refresh projects list
    // This will be handled by the useProjects hook
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading projects</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track your music production projects
            </p>
          </div>
          <Button
            onClick={() => navigate('/project/new')}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <DashboardLayout>
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectUpdated={handleProjectUpdated}
              onProjectDeleted={handleProjectDeleted}
              onProjectSelect={handleProjectSelect}
              isSelected={selectedProject?.id === project.id}
            />
          ))}
        </DashboardLayout>
      </motion.div>
    </div>
  )
} 
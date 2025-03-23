import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { Project } from '@/lib/types'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, MusicNote, Calendar, PencilSimple, Clock } from '@phosphor-icons/react'
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge'
import EditProjectDialog from '@/components/project/EditProjectDialog'
import DeleteProjectDialog from '@/components/project/DeleteProjectDialog'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, isLoading, error, updateProject } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [isProjectLoading, setIsProjectLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const foundProject = projects.find(p => p.id === id)
      if (foundProject) {
        setProject(foundProject)
        setIsProjectLoading(false)
      } else {
        setIsProjectLoading(false)
        setNotFound(true)
      }
    }
  }, [id, projects])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject)
    setIsEditDialogOpen(false)
    toast.success('Project updated', {
      description: `"${updatedProject.title}" has been updated.`,
    })
  }

  const handleProjectDeleted = () => {
    navigate('/')
    toast.success('Project deleted', {
      description: 'The project has been removed.',
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  if (isLoading || isProjectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <h2 className="text-2xl font-bold">Project Not Found</h2>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>

          <div className="ml-auto space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <PencilSimple className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">BPM</h3>
                      <div className="flex items-center">
                        <MusicNote className="mr-1.5 h-4 w-4 text-muted-foreground" />
                        <span>{project.bpm}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Key</h3>
                      <div className="flex items-center">
                        <MusicNote className="mr-1.5 h-4 w-4 text-muted-foreground" />
                        <span>{project.key}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                      <div className="flex items-center">
                        <Calendar className="mr-1.5 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(project.dateCreated)}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Last Updated
                      </h3>
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4 text-muted-foreground" />
                        <span>{formatDistanceToNow(new Date(project.lastModified))} ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{project.description || 'No description provided.'}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Genre</h3>
                    <p className="text-sm">{project.genre || 'Not specified'}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags && project.tags.length > 0 ? (
                        project.tags.map((tag, index) => (
                          <div key={index} className="bg-muted px-2.5 py-1 rounded-full text-xs">
                            {tag}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional project content can be added here */}
          </div>
        </div>
      </main>

      <EditProjectDialog
        project={project}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onProjectUpdated={handleProjectUpdated}
      />

      <DeleteProjectDialog
        projectId={project.id}
        projectTitle={project.title}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onProjectDeleted={handleProjectDeleted}
      />

      <Footer />
    </div>
  )
}

export default ProjectDetail

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProjectList from '@/components/ProjectList'
import Timer from '@/components/Timer'
import Stats from '@/components/Stats'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { Project, Session } from '@/lib/types'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Clock } from '@phosphor-icons/react'
import { SessionsOverview } from '@/components/sessions/SessionsOverview'

const Index = () => {
  const { projects, isLoading, error, updateProject: updateProjectAsync } = useProjects()
  const { user, profile, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user && !authLoading) {
      console.log('[Index] No user found, redirecting to login page')
      // Use setTimeout to ensure this runs after the component is mounted
      // This helps prevent the "Object may no longer exist" error
      setTimeout(() => {
        navigate('/login')
      }, 0)
      return
    }
  }, [user, authLoading, navigate])

  // Add effect to handle initial data loading
  useEffect(() => {
    if (!user || authLoading) return

    // Force a refetch of projects when component mounts
    queryClient.invalidateQueries({ 
      queryKey: ['projects', user.id]
    })

    // Also fetch sessions
    const fetchSessions = async () => {
      try {
        console.log('Fetching sessions for user:', user.id)

        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        console.log('Fetched sessions:', data)
        // Cast the data to Session[] to match the state type
        setSessions((data || []) as Session[])
      } catch (error) {
        console.error('Error fetching sessions:', error)
        toast.error('Failed to load sessions')
      }
    }

    fetchSessions()
  }, [user, authLoading, queryClient])

  const handleDragEnd = (activeId: string, overId: string) => {
    if (!projects) return

    const oldIndex = projects.findIndex(p => p.id === activeId)
    const newIndex = projects.findIndex(p => p.id === overId)

    const newProjects = [...projects]
    const [movedProject] = newProjects.splice(oldIndex, 1)
    newProjects.splice(newIndex, 0, movedProject)

    // Update the project with new last_modified timestamp
    const projectToUpdate = {
      ...movedProject,
      last_modified: new Date().toISOString(),
    }

    updateProjectAsync(projectToUpdate).catch(error => {
      console.error('Error updating project order:', error)
      toast.error('Failed to update project order')
    })
  }

  if (authLoading || !user || !profile) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Error loading projects</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10 flex-1 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 md:mb-12 lg:items-end">
          <div className="lg:col-span-2 overflow-x-hidden">
            <Stats
              projects={projects || []}
              sessions={sessions}
              selectedProject={selectedProject}
              beatActivities={[]} // Add empty array for now
            />
          </div>
          <div className="grid grid-cols-1 gap-6 overflow-x-hidden">
            <Timer />
            <SessionsOverview />
          </div>
        </div>

        <div className="mb-12 overflow-x-hidden">
          <ProjectList
            projectList={projects || []}
            isLoading={isLoading}
            onProjectSelect={setSelectedProject}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Index

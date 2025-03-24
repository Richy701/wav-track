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
        setSessions(data || [])
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 md:mb-12 lg:items-end">
          <div className="lg:col-span-2">
            <Stats
              projects={projects || []}
              sessions={sessions}
              selectedProject={selectedProject}
            />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Timer />
            {/* Coming Soon: Session History */}
            <div className="bg-card rounded-lg p-3 sm:p-4 relative overflow-hidden group">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent dark:from-primary/[0.03]" />

              {/* Content */}
              <div className="relative flex flex-col">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 dark:bg-primary/20">
                      <Clock className="h-4 w-4 text-primary" weight="fill" />
                    </div>
                    <h3 className="font-medium text-xs">Sessions Feature Coming Soon!</h3>
                  </div>
                  <Badge className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    Coming Soon
                  </Badge>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted/80 dark:bg-muted/60 border border-border shadow-sm flex items-center justify-center">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full animate-pulse',
                            i === 0 && 'bg-gradient-to-r from-violet-500 to-indigo-500',
                            i === 1 && 'bg-gradient-to-r from-blue-500 to-cyan-500',
                            i === 2 && 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                          )}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted/70 dark:bg-muted/50 rounded-md animate-pulse" />
                        <div className="h-3 w-16 bg-muted/60 dark:bg-muted/40 rounded-md animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border/5 dark:border-border/10">
                  <h4 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    Upcoming Features
                  </h4>
                  <ul className="space-y-1.5">
                    {[
                      'Track your studio sessions',
                      'Monitor productivity trends',
                      'Analyze work patterns',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-foreground">
                        <div className={cn(
                          'w-1 h-1 rounded-full',
                          i === 0 && 'bg-gradient-to-r from-violet-500 to-indigo-500',
                          i === 1 && 'bg-gradient-to-r from-blue-500 to-cyan-500',
                          i === 2 && 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                        )} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">Stay tuned for updates!</p>
                  <button className="text-[10px] sm:text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                    Join Waitlist →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
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

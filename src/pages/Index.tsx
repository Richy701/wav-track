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

const Index = () => {
  const { projects, isLoading, error, updateProject } = useProjects()
  const { user, profile, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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

  useEffect(() => {
    if (!user || authLoading) return

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
  }, [user, authLoading])

  // Add debug render log
  console.log('Render state:', {
    authLoading,
    hasUser: !!user,
    projectsCount: projects?.length || 0,
    sessionsCount: sessions.length,
  })

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

    updateProject(projectToUpdate).catch(error => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 md:mb-12">
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
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-xs sm:text-sm">Recent Sessions</h3>
                  <Badge variant="coming-soon" className="scale-75 sm:scale-90">
                    COMING SOON
                  </Badge>
                </div>

                {/* Preview content */}
                <div className="space-y-1.5 sm:space-y-2">
                  {/* Sample session items with shimmer effect */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted/80 dark:bg-muted/60 border border-border shadow-sm flex items-center justify-center">
                        <div
                          className={cn(
                            'w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-pulse',
                            i === 0 && 'bg-gradient-to-r from-violet-500 to-indigo-500',
                            i === 1 && 'bg-gradient-to-r from-blue-500 to-cyan-500',
                            i === 2 && 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                          )}
                        />
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1">
                        <div className="h-1.5 sm:h-2 w-16 sm:w-20 bg-muted/70 dark:bg-muted/50 rounded-md animate-pulse" />
                        <div className="h-1 sm:h-1.5 w-12 sm:w-14 bg-muted/60 dark:bg-muted/40 rounded-md animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature preview */}
                <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-border/5 dark:border-border/10">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                    Coming features:
                  </p>
                  <ul className="mt-1 sm:mt-1.5 space-y-0.5 sm:space-y-1">
                    <li className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                      Track daily focus sessions
                    </li>
                    <li className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      View productivity trends
                    </li>
                    <li className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" />
                      Set and achieve goals
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <ProjectList
            projects={projects || []}
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

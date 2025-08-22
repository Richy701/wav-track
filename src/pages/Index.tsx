import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSupabaseSubscription } from '@/hooks/useCleanup'
import ProjectList from '@/components/ProjectList'
import Timer from '@/components/Timer'
import Stats from '@/components/Stats'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useProjects } from '@/hooks/useProjects'
import { Project, Session, BeatActivity } from '@/lib/types'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Clock } from '@phosphor-icons/react'
import { SessionsOverview } from '@/components/sessions/SessionsOverview'
import { logger } from '@/utils/logger'
import { useDebouncedCallback } from 'use-debounce'

const Index = () => {
  const { projects, isLoading, error, updateProject: updateProjectAsync } = useProjects()
  const { user, profile, isLoading: authLoading, isInitialized } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [beatActivities, setBeatActivities] = useState<BeatActivity[]>([])
  
  // Memoized data to prevent unnecessary re-renders
  const memoizedSessions = useMemo(() => 
    sessions.filter(session => session.user_id === user?.id), 
    [sessions, user?.id]
  )
  
  const memoizedBeatActivities = useMemo(() => 
    beatActivities.filter(activity => activity.projectId), 
    [beatActivities]
  )
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const queryClient = useQueryClient()
  const { addSubscription } = useSupabaseSubscription()

  // Optimized debugging
  logger.debug('[Index] Auth state:', { user: !!user, profile: !!profile, authLoading, isInitialized })

  useEffect(() => {
    if (isInitialized && !user) {
      logger.debug('[Index] No user found after initialization, redirecting to login page')
      navigate('/login')
      return
    }
  }, [user, isInitialized, navigate])

  // Memoized data fetching function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!user?.id) return
    
    try {
      logger.performance('Fetching data for user', user.id)

      // Fetch sessions and beat activities in parallel
      const [sessionsResult, beatActivitiesResult] = await Promise.all([
        supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('beat_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
      ])

      if (sessionsResult.error) {
        logger.error('Supabase error:', sessionsResult.error)
        throw sessionsResult.error
      }
      
      if (beatActivitiesResult.error) {
        logger.error('Error fetching beat activities:', beatActivitiesResult.error)
        throw beatActivitiesResult.error
      }

      logger.debug('Fetched sessions:', sessionsResult.data?.length)
      setSessions((sessionsResult.data || []) as Session[])

      // Memoized transformation
      const transformedBeatActivities = (beatActivitiesResult.data || []).map(activity => ({
        id: activity.id,
        projectId: activity.project_id,
        date: activity.date,
        count: activity.count,
        timestamp: activity.timestamp,
      }))

      logger.debug('Fetched beat activities:', transformedBeatActivities.length)
      setBeatActivities(transformedBeatActivities)
      logger.performance('Data fetch completed', {
        sessions: sessionsResult.data?.length || 0,
        beatActivities: transformedBeatActivities.length
      })
    } catch (error) {
      logger.error('Error fetching data:', error)
      toast.error('Failed to load data')
    }
  }, [user?.id])

  // Add effect to handle initial data loading - optimized
  useEffect(() => {
    if (!user || !isInitialized) return

    // Force a refetch of projects when component mounts
    queryClient.invalidateQueries({ 
      queryKey: ['projects', user.id]
    })

    fetchData()

    // Set up real-time subscription for beat activities - optimized with cleanup
    const beatActivitiesSubscription = supabase
      .channel(`beat_activities_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beat_activities',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          logger.debug('Beat activity change detected:', payload.eventType)
          
          try {
            // Debounced state updates to prevent excessive re-renders
            if (payload.eventType === 'INSERT') {
              const newActivity = {
                id: payload.new.id,
                projectId: payload.new.project_id,
                date: payload.new.date,
                count: payload.new.count,
                timestamp: payload.new.timestamp,
              }
              setBeatActivities(prev => {
                // Prevent duplicate insertions
                if (prev.some(activity => activity.id === newActivity.id)) {
                  return prev
                }
                return [newActivity, ...prev]
              })
            }
            else if (payload.eventType === 'DELETE') {
              setBeatActivities(prev => prev.filter(activity => activity.id !== payload.old.id))
            }
            else if (payload.eventType === 'UPDATE') {
              setBeatActivities(prev => 
                prev.map(activity => 
                  activity.id === payload.new.id
                    ? {
                        ...activity,
                        count: payload.new.count,
                        timestamp: payload.new.timestamp,
                      }
                    : activity
                )
              )
            }
          } catch (error) {
            logger.error('Error handling beat activity change:', error)
            // Fallback to refetch if there's an error
            fetchData()
          }
        }
      )
      .subscribe()

    // Use the cleanup hook to manage subscription
    addSubscription(beatActivitiesSubscription)

    return () => {
      // Additional cleanup - remove all channels to prevent memory leaks
      supabase.removeAllChannels()
    }
  }, [user?.id, isInitialized, fetchData])

  // Memoized drag handler to prevent unnecessary re-renders
  const handleDragEnd = useCallback((activeId: string, overId: string) => {
    if (!projects) return

    const oldIndex = projects.findIndex(p => p.id === activeId)
    const newIndex = projects.findIndex(p => p.id === overId)

    if (oldIndex === newIndex) return // No change needed

    const newProjects = [...projects]
    const [movedProject] = newProjects.splice(oldIndex, 1)
    newProjects.splice(newIndex, 0, movedProject)

    // Update the project with new last_modified timestamp
    const projectToUpdate = {
      ...movedProject,
      last_modified: new Date().toISOString(),
    }

    updateProjectAsync(projectToUpdate).catch(error => {
      logger.error('Error updating project order:', error)
      toast.error('Failed to update project order')
    })
  }, [projects, updateProjectAsync])

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
    <div className="space-y-6 min-w-0 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start min-w-0">
        <div className="lg:col-span-2 min-w-0 w-full">
          <Stats
            sessions={memoizedSessions}
            selectedProject={selectedProject}
            beatActivities={memoizedBeatActivities}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 h-fit min-w-0 w-full">
          <div className="min-h-[350px] lg:min-h-[480px] min-w-0 w-full">
            <Timer />
          </div>
          <div className="min-h-[450px] lg:min-h-[580px] min-w-0 w-full">
            <SessionsOverview />
          </div>
        </div>
      </div>

      <div className="min-w-0 w-full">
        <ProjectList
          projectList={projects || []}
          isLoading={isLoading}
          onProjectSelect={setSelectedProject}
        />
      </div>
    </div>
  )
}

export default Index

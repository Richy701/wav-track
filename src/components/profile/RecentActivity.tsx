import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MusicNote, CheckCircle as PhCheckCircle } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'

interface Activity {
  type: 'beat' | 'project'
  icon: JSX.Element
  text: string
  date: Date
  projectId: string
}

export const RecentActivity = memo(function RecentActivity() {
  const navigate = useNavigate()
  const { user, isInitialized } = useAuth()

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ['recent-activities', user?.id, isInitialized],
    queryFn: async () => {
      if (!user || !isInitialized) return []

      // Simplified query - just get recent beat activities to avoid complex joins
      try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: beatActivities, error: beatError } = await supabase
          .from('beat_activities')
          .select('id, count, created_at, project_id')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5)

        if (beatError) {
          console.error('Beat activities error:', beatError)
          return []
        }

        // Process beat activities into display format
        return (beatActivities || []).map(beat => ({
          type: 'beat' as const,
          icon: <MusicNote className="h-4 w-4 text-primary" />,
          text: `Created ${beat.count} beat${beat.count > 1 ? 's' : ''}`,
          date: new Date(beat.created_at),
          projectId: beat.project_id,
        }))
      } catch (error) {
        console.error('Recent activities error:', error)
        return []
      }
    },
    enabled: !!user && isInitialized,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Failed to load recent activities
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <MusicNote className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No recent activity in the last 7 days
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Start a new session to see your activity here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={`${activity.type}-${index}`}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => navigate(`/project/${activity.projectId}`)}
        >
          <div className="flex items-center space-x-3">
            {activity.icon}
            <span className="text-sm text-gray-600">{activity.text}</span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(activity.date, { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  )
})

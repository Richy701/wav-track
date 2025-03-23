import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MusicNote, CheckCircle as PhCheckCircle } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { getBeatsCreatedInRange, getProjectsByStatus } from '@/lib/data'

interface Activity {
  type: 'beat' | 'completion'
  icon: React.ReactNode
  text: string
  date: Date
  projectId: string
}

export function RecentActivity() {
  const navigate = useNavigate()
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoadingActivities(true)
        const activities = await getRecentActivities()
        setRecentActivities(activities)
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setIsLoadingActivities(false)
      }
    }
    loadActivities()
  }, [])

  const getRecentActivities = async () => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get recent beats created
    const recentBeats = await getBeatsCreatedInRange(thirtyDaysAgo, now)
      .then(beats => beats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      .then(beats => beats.slice(0, 3))

    // Get recently completed projects
    const completedProjects = await getProjectsByStatus('completed')
      .then(projects =>
        projects.sort(
          (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        )
      )
      .then(projects => projects.slice(0, 3))

    // Combine and sort activities
    const activities = await Promise.all([
      ...recentBeats.map(async beat => ({
        type: 'beat',
        icon: <MusicNote className="h-4 w-4 text-primary" />,
        text: `Created ${beat.count} beat${beat.count > 1 ? 's' : ''}`,
        date: new Date(beat.date),
        projectId: beat.projectId,
      })),
      ...completedProjects.map(async project => ({
        type: 'completion',
        icon: <PhCheckCircle className="h-4 w-4 text-green-500" />,
        text: `Completed project "${project.title}"`,
        date: new Date(project.lastModified),
        projectId: project.id,
      })),
    ])
      .then(activities => activities.sort((a, b) => b.date.getTime() - a.date.getTime()))
      .then(activities => activities.slice(0, 5))

    return activities
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoadingActivities ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">Loading activities...</p>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Start creating beats to see your activity here!</p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div className="mt-0.5">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm group-hover:text-primary transition-colors">
                    {activity.text}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.date, { addSuffix: true })}
                  </p>
                </div>
                {activity.projectId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate(`/project/${activity.projectId}`)}
                  >
                    View
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

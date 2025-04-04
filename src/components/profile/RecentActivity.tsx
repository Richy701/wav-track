import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MusicNote, CheckCircle as PhCheckCircle } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { getBeatsCreatedInRange, getProjectsByStatus } from '@/lib/data'
import { Spinner } from '@/components/ui/spinner'

interface Activity {
  type: 'beat' | 'project'
  icon: JSX.Element
  text: string
  date: Date
  projectId: string
}

export function RecentActivity() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)

  const getRecentActivities = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get recent beats
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7) // Last 7 days

      console.log('Fetching recent activities:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const recentBeats = await getBeatsCreatedInRange(startDate, endDate)
      console.log('Recent beats fetched:', recentBeats)

      // Get recently completed projects
      const completedProjects = await getProjectsByStatus('completed')
      console.log('Completed projects fetched:', completedProjects)

      // Process beats
      const beatActivities = recentBeats
        .filter(beat => {
          const beatDate = new Date(beat.date)
          
          // Skip activities from April 3rd, 2023
          const april3rd2023 = new Date('2023-04-03T00:00:00.000Z')
          const isFromApril3rd = beatDate.getFullYear() === april3rd2023.getFullYear() &&
                                 beatDate.getMonth() === april3rd2023.getMonth() &&
                                 beatDate.getDate() === april3rd2023.getDate()
          
          if (isFromApril3rd) {
            console.log('Filtering out beat activity from April 3rd:', beat)
            return false
          }
          
          return true
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(beat => ({
          type: 'beat' as const,
          icon: <MusicNote className="h-4 w-4 text-primary" />,
          text: `Created ${beat.count} beat${beat.count > 1 ? 's' : ''}`,
          date: new Date(beat.date),
          projectId: beat.projectId,
        }))

      // Process completed projects
      const projectActivities = completedProjects
        .filter(project => {
          const projectDate = new Date(project.dateCreated || '')
          
          // Skip projects from April 3rd, 2023
          const april3rd2023 = new Date('2023-04-03T00:00:00.000Z')
          const isFromApril3rd = projectDate.getFullYear() === april3rd2023.getFullYear() &&
                                 projectDate.getMonth() === april3rd2023.getMonth() &&
                                 projectDate.getDate() === april3rd2023.getDate()
          
          if (isFromApril3rd) {
            console.log('Filtering out completed project from April 3rd:', project)
            return false
          }
          
          return true
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateCreated || 0).getTime()
          const dateB = new Date(b.dateCreated || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 3)
        .map(project => {
          console.log('Processing project for activity:', {
            id: project.id,
            title: project.title,
            dateCreated: project.dateCreated,
            parsedDate: new Date(project.dateCreated || ''),
            isFromApril3rd: new Date(project.dateCreated || '').toISOString().includes('2023-04-03')
          })
          
          return {
            type: 'project' as const,
            icon: <PhCheckCircle className="h-4 w-4 text-green-500" />,
            text: `Completed "${project.title}"`,
            date: new Date(project.dateCreated || ''),
            projectId: project.id,
          }
        })

      // Combine and sort activities
      const combinedActivities = [...beatActivities, ...projectActivities]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)

      console.log('Combined activities:', combinedActivities.map(a => ({
        type: a.type,
        text: a.text,
        date: a.date.toISOString(),
        projectId: a.projectId
      })))
      setActivities(combinedActivities)
    } catch (err) {
      console.error('Error fetching recent activities:', err)
      setError('Failed to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRecentActivities()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No recent activities
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
}

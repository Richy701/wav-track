import React, { memo, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { format, subDays, isSameDay } from 'date-fns'
import { getBeatsCreatedInRange, getProjectsByStatus } from '@/lib/data'
import { BeatActivity, Project } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'

// Memoize the custom tooltip component
const CustomTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div 
      className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      <div className="text-xs font-medium text-muted-foreground mb-1">
        {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
      </div>
      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: entry.color }}
        >
          <span>
            {entry.value} {entry.dataKey}
          </span>
        </div>
      ))}
    </div>
  )
})

CustomTooltip.displayName = 'CustomTooltip'

interface ChartData {
  date: Date
  label: string
  beats: number
  completed: number
}

export function ProjectGraph() {
  const { profile } = useAuth()
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const today = new Date()
        
        // Calculate the start of the week (Monday)
        const day = today.getDay()
        const diff = day === 0 ? 6 : day - 1 // If Sunday (0), go back 6 days, otherwise go back (day-1) days
        const weekStart = subDays(today, diff)
        
        // Get beats created in the last 7 days
        const [beatActivities, completedProjects] = await Promise.all([
          getBeatsCreatedInRange(weekStart, today),
          getProjectsByStatus('completed')
        ])
        
        console.log('Fetched data:', {
          beatActivities,
          completedProjects,
          dateRange: {
            from: weekStart.toISOString(),
            to: today.toISOString()
          }
        })
        
        // Create a map to store daily totals
        const dailyData = new Map<string, ChartData>()
        
        // Initialize data for all 7 days starting from Monday
        for (let i = 0; i < 7; i++) {
          const date = subDays(today, diff - i)
          const dateStr = format(date, 'yyyy-MM-dd')
          dailyData.set(dateStr, {
            date,
            label: format(date, 'EEE'),
            beats: 0,
            completed: 0
          })
        }
        
        // Aggregate beat activities by date
        beatActivities.forEach((activity: BeatActivity) => {
          const dateStr = format(new Date(activity.date), 'yyyy-MM-dd')
          const dayData = dailyData.get(dateStr)
          if (dayData) {
            dayData.beats += activity.count
          }
        })

        // Aggregate completed projects by date
        completedProjects.forEach((project: Project) => {
          const projectDate = new Date(project.lastModified)
          // Use isSameDay to check if the project was completed within the last 7 days
          const matchingDate = Array.from(dailyData.values()).find(dayData => 
            isSameDay(dayData.date, projectDate)
          )
          if (matchingDate) {
            matchingDate.completed += 1
          }
        })
        
        // Convert map to array and sort by date
        const chartData = Array.from(dailyData.values())
          .sort((a, b) => a.date.getTime() - b.date.getTime())
        
        console.log('Processed chart data:', chartData)
        
        setData(chartData)
      } catch (error) {
        console.error('Error loading activity data:', error)
        setError(error instanceof Error ? error : new Error('Failed to load activity data'))
      } finally {
        setIsLoading(false)
      }
    }

    loadActivityData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[200px] w-full flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[200px] w-full flex items-center justify-center text-destructive">
            <p>Error loading activity data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Your project activity over the last week</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500" />
              <span className="text-muted-foreground">Beats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Completed</span>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="beatsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="rgb(217, 70, 239)" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="rgb(5, 150, 105)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="beats"
                stroke="url(#beatsGradient)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: 'white',
                  className: 'dark:stroke-zinc-900',
                }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="url(#completedGradient)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#10b981',
                  strokeWidth: 2,
                  stroke: 'white',
                  className: 'dark:stroke-zinc-900',
                }}
                isAnimationActive={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'currentColor',
                  fontSize: 10,
                  opacity: 0.5,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: 'currentColor',
                  fontSize: 10,
                  opacity: 0.5,
                }}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                isAnimationActive={false}
                cursor={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 
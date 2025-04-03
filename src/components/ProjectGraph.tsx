import React, { useMemo, useCallback, memo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  title: string
  created_at: string
  status: 'draft' | 'in_progress' | 'completed'
  bpm: number
  key: string
  genre: string
  mood: string
  description: string
  duration: number
  waveform_data: number[]
  audio_url: string | null
  cover_image_url: string | null
  is_public: boolean
  collaborators: string[]
  tags: string[]
  updated_at: string
}

interface ProjectGraphProps {
  projects: Project[]
  className?: string
}

// Memoize the tooltip component to prevent re-renders
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div 
      className="bg-background border rounded-lg shadow-lg p-4"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="font-medium text-sm">{label}</div>
      <div className="text-2xl font-bold">{payload[0].value}</div>
      <div className="text-xs text-muted-foreground mt-1">projects created</div>
    </div>
  )
})

CustomTooltip.displayName = 'CustomTooltip'

export const ProjectGraph: React.FC<ProjectGraphProps> = memo(({ projects, className }) => {
  // Group projects by month
  const chartData = useMemo(() => {
    const months: { [key: string]: number } = {}
    const now = new Date()
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6))

    projects.forEach(project => {
      const date = new Date(project.created_at)
      if (date >= sixMonthsAgo) {
        const monthKey = format(date, 'MMM yyyy')
        months[monthKey] = (months[monthKey] || 0) + 1
      }
    })

    return Object.entries(months).map(([date, count]) => ({
      date,
      count,
    }))
  }, [projects])

  return (
    <div 
      className={cn('relative h-[300px] w-full', className)}
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            isAnimationActive={false}
            animationDuration={0}
            cursor={{ stroke: 'rgb(99, 102, 241)', strokeWidth: 1 }}
            wrapperStyle={{ 
              transition: 'none',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              perspective: 1000,
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="rgb(99, 102, 241)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'rgb(99, 102, 241)' }}
            activeDot={{ r: 6, fill: 'rgb(99, 102, 241)' }}
            isAnimationActive={false}
            animationDuration={0}
            animationBegin={0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

ProjectGraph.displayName = 'ProjectGraph' 
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList,
  LineChart,
  Line,
  TooltipProps,
} from 'recharts'
import { getBeatsDataForChart, getBeatsCreatedByProject } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react'
import React from 'react'

type ChartView = 'bar' | 'line'

interface BeatsChartProps {
  timeRange: 'day' | 'week' | 'year'
  projects: Project[]
  selectedProject?: Project | null
}

type ChartData = {
  label: string
  value: number
  cumulative?: number
}

export function BeatsChart({ timeRange, projects, selectedProject }: BeatsChartProps) {
  const [beatsData, setBeatsData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedBar, setHighlightedBar] = useState<string | null>(null)
  const [chartView, setChartView] = useState<ChartView>('bar')
  const [refreshKey, setRefreshKey] = useState(0)

  // Filter out soft-deleted projects
  const activeProjects = useMemo(() => 
    projects.filter(project => !project.is_deleted),
    [projects]
  )

  // Calculate max value for YAxis domain
  const maxValue = Math.max(...beatsData.map(d => d.value))
  const yAxisMax = maxValue === 0 ? 0 : Math.max(1, Math.ceil(maxValue * 1.2))

  // Calculate cumulative data for line chart
  const cumulativeData = beatsData.reduce((acc, curr) => {
    const lastValue = acc.length > 0 ? (acc[acc.length - 1]?.cumulative ?? 0) : 0
    acc.push({
      ...curr,
      cumulative: lastValue + curr.value,
    })
    return acc
  }, [] as ChartData[])

  // Update refreshKey when projects change or when selectedProject changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [activeProjects, selectedProject])

  // Fetch data when timeRange, project selection, or refreshKey changes
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getBeatsDataForChart(timeRange, selectedProject?.id)
        if (isMounted) {
          setBeatsData(data)
        }
      } catch (error) {
        console.error('Error fetching beats data:', error)
        if (isMounted) {
          setBeatsData([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    // Remove the interval refresh since we're handling updates from the parent component
    return () => {
      isMounted = false
    }
  }, [timeRange, selectedProject, refreshKey])

  const CustomTooltip = ({
    active,
    payload,
    label,
    ...props
  }: TooltipProps<number, string> & { isHighlighted?: boolean }) => {
    if (active && payload && payload.length) {
      const isHighlighted = props.isHighlighted
      return (
        <div
          className={cn(
            'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3',
            'animate-in fade-in zoom-in duration-200',
            isHighlighted && 'ring-2 ring-violet-500 dark:ring-violet-400'
          )}
        >
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {payload[0].value}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    )
  }

  // If there's no data, show a message
  if (beatsData.length === 0 || maxValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No beats recorded yet</p>
        <p className="text-xs mt-1">Create a beat to see your activity</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "space-y-4 w-full relative z-0 transition-opacity duration-500",
    )}>
      <div className="flex justify-end px-2 sm:px-4">
        <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full">
          <button
            onClick={() => setChartView('bar')}
            className={cn(
              'p-1.5 rounded-full transition-all duration-200',
              chartView === 'bar'
                ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            )}
            title="Bar chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartView('line')}
            className={cn(
              'p-1.5 rounded-full transition-all duration-200',
              chartView === 'line'
                ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            )}
            title="Line chart"
          >
            <LineChartIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'bar' ? (
            <BarChart
              data={beatsData}
              margin={{ top: 16, right: 8, left: 8, bottom: 32 }}
              barGap={4}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={timeRange === 'day' ? 1 : 0}
                tick={props => {
                  const { x, y, payload } = props
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="middle"
                        fill="currentColor"
                        opacity={0.7}
                        fontSize={11}
                        className="dark:text-zinc-400"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
                height={40}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: 'currentColor',
                  opacity: 0.7,
                  className: 'dark:text-zinc-400',
                }}
                domain={[0, yAxisMax]}
                dx={-8}
                tickCount={Math.min(yAxisMax + 1, 5)}
              />
              <Tooltip
                content={CustomTooltip}
                cursor={false}
                isAnimationActive={false}
              />
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={timeRange === 'year' ? 16 : 32}
                animationDuration={500}
                animationEasing="ease"
                className="transition-all duration-300"
                isAnimationActive={true}
                onMouseOver={(data) => setHighlightedBar(data.label)}
                onMouseLeave={() => setHighlightedBar(null)}
              >
                {beatsData.map((entry) => (
                  <LabelList
                    key={entry.label}
                    dataKey="value"
                    position="top"
                    fill={entry.label === highlightedBar ? 'rgb(139, 92, 246)' : 'currentColor'}
                    fontSize={entry.label === highlightedBar ? 12 : 10}
                    className={cn(
                      'transition-all duration-200 dark:text-zinc-400',
                      entry.label === highlightedBar &&
                        'font-semibold text-violet-500 dark:text-violet-400'
                    )}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={cumulativeData}
              margin={{ top: 16, right: 8, left: 8, bottom: 16 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={timeRange === 'day' ? 1 : 0}
                tick={props => {
                  const { x, y, payload } = props
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="middle"
                        fill="currentColor"
                        opacity={0.7}
                        fontSize={11}
                        className="dark:text-zinc-400"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
                height={40}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: 'currentColor',
                  opacity: 0.7,
                  className: 'dark:text-zinc-400',
                }}
                dx={-8}
                tickCount={Math.min(Math.max(...cumulativeData.map(d => d.cumulative || 0)) + 1, 5)}
              />
              <Tooltip
                content={CustomTooltip}
                cursor={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                dot={false}
                animationDuration={500}
                animationEasing="ease"
                isAnimationActive={true}
                activeDot={{
                  r: 5,
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: 'white',
                  className: 'dark:stroke-zinc-900',
                }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

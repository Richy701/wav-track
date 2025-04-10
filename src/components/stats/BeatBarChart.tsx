import React, { useMemo, memo, useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { TrendUp, TrendDown, ChartBar, ChartLine, Waveform, Icon } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getBeatsDataForChart } from '@/lib/data'
import { Spinner } from '@/components/ui/spinner'

// Define the chart configuration type
type ChartConfig = {
  [key: string]: {
    label: string
    color: string
    icon: Icon
  }
}

// Chart configuration
const chartConfig: ChartConfig = {
  value: {
    label: "Beats",
    color: "rgb(139, 92, 246)",
    icon: Waveform,
  },
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    payload: ChartData
  }>
  label?: string
}

interface BeatBarChartProps {
  projects: Project[]
  selectedProject?: Project | null
  timeRange: 'day' | 'week' | 'year'
  className?: string
  showHeader?: boolean
  chartType: 'bar' | 'line'
}

type ChartData = {
  label: string
  value: number
  cumulative?: number
  date?: string
}

// Enhanced tooltip component with config-driven approach
const ChartTooltipContent = memo(({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null

  // Format the full date based on the timeRange
  const fullDate = payload[0].payload.date ? format(new Date(payload[0].payload.date), 'EEEE, MMMM d, yyyy') : label

  return (
    <div className="rounded-lg bg-background/95 backdrop-blur-sm border border-border shadow-lg px-3 py-2 space-y-2">
      <p className="text-xs text-muted-foreground font-medium border-b border-border pb-1.5">{fullDate}</p>
      {payload.map((entry) => {
        const config = chartConfig[entry.dataKey]
        const Icon = config?.icon
        return (
          <div key={entry.dataKey} className="flex items-center gap-2.5">
            {Icon && (
              <Icon 
                weight="duotone"
                className="h-4 w-4" 
                style={{ color: config.color }} 
              />
            )}
            <span className="font-medium text-sm" style={{ color: config.color }}>
              {entry.value}
            </span>
            <span className="text-muted-foreground text-xs">
              {config.label}
            </span>
          </div>
        )
      })}
    </div>
  )
})

ChartTooltipContent.displayName = 'ChartTooltipContent'

export const BeatBarChart: React.FC<BeatBarChartProps> = memo(({ 
  projects, 
  selectedProject, 
  timeRange,
  className,
  showHeader = true,
  chartType
}) => {
  const [beatsData, setBeatsData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Memoize data fetching function
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getBeatsDataForChart(timeRange, selectedProject?.id)
      // Add opacity for zero values
      const processedData = data.map(item => ({
        ...item,
        opacity: item.value === 0 ? 0.2 : 1
      }))
      setBeatsData(processedData)
    } catch (error) {
      console.error('Error fetching beats data:', error)
      setError(error instanceof Error ? error : new Error('Failed to fetch beats data'))
      setBeatsData([])
    } finally {
      setIsLoading(false)
    }
  }, [timeRange, selectedProject?.id])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate trend percentage
  const trendInfo = useMemo(() => {
    if (beatsData.length < 2) return { showTrend: false, percentage: 0 }
    
    const lastValue = beatsData[beatsData.length - 1].value
    const previousValue = beatsData[beatsData.length - 2].value
    
    // Don't show trend if previous value is 0 or if there's a 100% decrease
    if (previousValue === 0 || (lastValue === 0 && previousValue > 0)) {
      return { showTrend: false, percentage: 0 }
    }
    
    const percentage = ((lastValue - previousValue) / previousValue) * 100
    return { 
      showTrend: true, 
      percentage
    }
  }, [beatsData])

  // Format label based on timeRange
  const formatLabel = (value: string) => {
    if (!value) return ''
    
    if (timeRange === 'day') {
      // For day view, show hour format
      return value
    } else if (timeRange === 'week') {
      // For week view, show abbreviated day names
      return value.slice(0, 3)
    } else {
      // For year view, show abbreviated month names
      return value.slice(0, 3)
    }
  }

  // Get timeframe label
  const timeframeLabel = timeRange === 'day' ? '24 hours' : timeRange === 'week' ? '7 days' : '12 months'

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-0">
          <div className="h-[300px] w-full flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-0">
          <div className="h-[300px] w-full flex items-center justify-center text-destructive">
            <p>Error loading beat data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (beatsData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-0">
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            <p>No beat data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={beatsData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatLabel}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar
                    dataKey="value"
                    fill={chartConfig.value.color}
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationBegin={0}
                  >
                    <LabelList
                      dataKey="value"
                      position="top"
                      offset={12}
                      className="fill-foreground transition-all duration-300 ease-out"
                      fontSize={11}
                      formatter={(value) => (value === 0 ? "" : value)}
                    />
                  </Bar>
                </BarChart>
              ) : (
                <LineChart
                  data={beatsData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatLabel}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={chartConfig.value.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: chartConfig.value.color,
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-2">
        {trendInfo.showTrend && (
          <div className="flex gap-2 font-medium leading-none">
            {trendInfo.percentage > 0 ? (
              <>
                Trending up by {trendInfo.percentage.toFixed(1)}% this period 
                <TrendUp className="h-4 w-4 text-emerald-500" />
              </>
            ) : (
              <>
                Trending down by {Math.abs(trendInfo.percentage).toFixed(1)}% this period
                <TrendDown className="h-4 w-4 text-rose-500" />
              </>
            )}
          </div>
        )}
        <div className="leading-none text-muted-foreground text-xs mt-2">
          Showing total beats created for the last {timeframeLabel}
        </div>
      </CardFooter>
    </Card>
  )
})

BeatBarChart.displayName = 'BeatBarChart' 
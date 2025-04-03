import { useEffect, useState, useCallback } from 'react'
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
  const [refreshKey, setRefreshKey] = useState(0)
  const [chartView, setChartView] = useState<ChartView>('bar')
  const [maxValue, setMaxValue] = useState(0)
  const [yAxisMax, setYAxisMax] = useState(0)

  // Calculate max value for YAxis domain
  useEffect(() => {
    if (beatsData.length > 0) {
      const max = Math.max(...beatsData.map(d => d.value || 0))
      setMaxValue(max)
      setYAxisMax(max === 0 ? 0 : Math.max(1, Math.ceil(max * 1.2)))
    } else {
      setMaxValue(0)
      setYAxisMax(0)
    }
  }, [beatsData])

  // Calculate cumulative data for line chart
  const cumulativeData = beatsData.length > 0 ? beatsData.reduce((acc, curr) => {
    const lastValue = acc.length > 0 ? (acc[acc.length - 1]?.cumulative ?? 0) : 0
    acc.push({
      ...curr,
      cumulative: lastValue + (curr.value || 0),
    })
    return acc
  }, [] as ChartData[]) : []

  // Add validation check for data
  const hasValidData = beatsData.length > 0

  // Update refreshKey when projects change or when selectedProject changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [projects, selectedProject])

  // Fetch data when timeRange, project selection, or refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        console.log('Starting to fetch beats data:', {
          timeRange,
          selectedProjectId: selectedProject?.id,
          timestamp: new Date().toISOString()
        })
        const data = await getBeatsDataForChart(timeRange, selectedProject?.id)
        console.log('Raw beats data:', data)
        console.log('Beats data fetched successfully:', {
          dataLength: data.length,
          data,
          timestamp: new Date().toISOString(),
          hasValidData: data.length > 0,
          maxValue: Math.max(...data.map(d => d.value || 0)),
          dataPoints: data.map(d => ({ label: d.label, value: d.value }))
        })
        setBeatsData(data)
      } catch (error) {
        console.error('Error fetching beats data:', {
          error,
          timeRange,
          selectedProjectId: selectedProject?.id,
          timestamp: new Date().toISOString()
        })
        setBeatsData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange, selectedProject, refreshKey])

  // Add logging for render conditions
  useEffect(() => {
    console.log('Chart render conditions:', {
      isLoading,
      beatsDataLength: beatsData.length,
      beatsData,
      maxValue,
      yAxisMax,
      hasValidData,
      cumulativeDataLength: cumulativeData.length,
      cumulativeData,
      chartView,
      timeRange
    })
  }, [isLoading, beatsData, maxValue, yAxisMax, hasValidData, cumulativeData, chartView, timeRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = data.date || new Date().toISOString().split('T')[0]
      const time = data.label || ''

      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in zoom-in duration-200">
          <div className="text-sm font-medium text-foreground">
            {date}
            {time && ` • ${time}`}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Beats: {data.value}
          </div>
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

  // If there's no data or invalid data, show a message
  if (!hasValidData) {
    console.log('No valid data to display:', {
      beatsDataLength: beatsData.length,
      hasValidData,
      maxValue,
      beatsData,
      timeRange,
      chartView
    })
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No beats recorded yet</p>
        <p className="text-xs mt-1">Create a beat to see your activity</p>
      </div>
    )
  }

  console.log('Rendering chart with data:', {
    beatsData,
    maxValue,
    yAxisMax,
    chartView,
    cumulativeData,
    timeRange,
    chartData: chartView === 'bar' ? beatsData : (timeRange === 'day' ? beatsData : cumulativeData)
  })

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartView('bar')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartView === 'bar'
                ? 'bg-violet-500 text-white scale-105'
                : 'hover:bg-violet-100 dark:hover:bg-violet-900/30'
            )}
            aria-label="Switch to bar chart view"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setChartView('line')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartView === 'line'
                ? 'bg-violet-500 text-white scale-105'
                : 'hover:bg-violet-100 dark:hover:bg-violet-900/30'
            )}
            aria-label="Switch to line chart view"
          >
            <LineChartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-4 md:mt-6 h-[200px] sm:h-[250px] md:h-[300px] w-full relative group overflow-hidden">
        <style>
          {`
            .recharts-bar-rectangle {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              transform-origin: bottom;
            }
            /* Remove default hover effects */
            .recharts-rectangle.recharts-bar-background-rectangle,
            .recharts-bar-rectangle.hover,
            .recharts-rectangle.hover,
            .recharts-bar-rectangle:hover .recharts-rectangle.hover,
            .recharts-bar-rectangle.recharts-active-bar .recharts-rectangle.hover,
            .recharts-bar-rectangle.recharts-active-bar .recharts-rectangle.recharts-bar-background-rectangle,
            .recharts-tooltip-cursor {
              fill: transparent !important;
              stroke: none !important;
              opacity: 0 !important;
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
            /* Enhanced hover effect */
            .recharts-bar-rectangle:hover {
              transform: scaleY(1.05);
              filter: brightness(1.1);
            }
            /* Dark mode hover */
            .dark .recharts-bar-rectangle:hover {
              filter: brightness(1.15);
            }
            /* Light mode hover */
            :not(.dark) .recharts-bar-rectangle:hover {
              filter: brightness(1.1);
            }
            /* Ensure smooth transitions */
            .recharts-bar-rectangles path {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            /* Remove any default active state backgrounds */
            .recharts-layer.recharts-bar-rectangles > g {
              fill: none !important;
            }
            /* Additional rules to prevent tooltip effects */
            .recharts-tooltip-wrapper {
              pointer-events: none !important;
            }
            .recharts-active-bar {
              fill: inherit !important;
            }
            .recharts-tooltip-cursor {
              display: none !important;
            }
            /* Mobile optimizations */
            @media (max-width: 640px) {
              .recharts-cartesian-axis-tick-text {
                font-size: 10px;
                transform: rotate(-45deg);
                text-anchor: end;
              }
              .recharts-label {
                font-size: 10px;
              }
              .recharts-bar-rectangle {
                width: 12px !important;
                rx: 4px !important;
              }
              .recharts-bar-gap {
                width: 4px !important;
              }
            }
            /* Ensure chart stays within bounds */
            .recharts-wrapper {
              max-width: 100%;
              overflow: hidden;
            }
            .recharts-surface {
              max-width: 100%;
            }
            /* Add entrance animation for bars */
            @keyframes barEntrance {
              from {
                transform: scaleY(0);
                opacity: 0;
              }
              to {
                transform: scaleY(1);
                opacity: 1;
              }
            }
            .recharts-bar-rectangle {
              animation: barEntrance 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}
        </style>
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'bar' ? (
            <BarChart
              data={beatsData}
              margin={{ top: 16, right: 8, left: 8, bottom: 32 }}
              barGap={4}
              className="animate-in fade-in duration-300"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="barGradientHoverLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(124, 58, 237)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity={0.45} />
                </linearGradient>
                <linearGradient id="barGradientHoverDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgb(79, 70, 229)" stopOpacity={0.5} />
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
                        opacity={0.9}
                        fontSize={11}
                        className="dark:text-zinc-100 font-medium"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
                height={40}
                className="dark:text-zinc-100"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: 'currentColor',
                  opacity: 0.5,
                  className: 'dark:text-zinc-100/50 font-medium',
                }}
                domain={[0, yAxisMax]}
                dx={-8}
                tickCount={Math.min(yAxisMax + 1, 5)}
                className="dark:text-zinc-100/50 font-medium"
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                strokeOpacity={0.05}
                vertical={false}
                horizontal={true}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(124, 58, 237, 0.1)' }}
                position={{ x: 0, y: 0 }}
                offset={0}
                wrapperStyle={{ pointerEvents: 'none' }}
                cursorStyle={{ stroke: 'rgba(124, 58, 237, 0.1)' }}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 8,
                  border: 'none',
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={timeRange === 'year' ? 16 : 32}
                animationDuration={500}
                className="transition-all duration-500 ease-in-out"
                isAnimationActive={true}
                activeBar={false}
                onMouseOver={(data, index) => {
                  setHighlightedBar(data.label)
                }}
                onMouseLeave={() => {
                  setHighlightedBar(null)
                }}
                background={{ fill: 'transparent', radius: 0 }}
                maxBarSize={100}
              >
                {beatsData.map((entry, index) => (
                  <LabelList
                    key={entry.label}
                    dataKey="value"
                    position="top"
                    fill={entry.label === highlightedBar ? 'rgb(139, 92, 246)' : 'currentColor'}
                    fontSize={entry.label === highlightedBar ? 12 : 10}
                    className={cn(
                      'transition-all duration-300 dark:text-zinc-100 font-medium',
                      entry.label === highlightedBar &&
                        'font-semibold text-violet-500 dark:text-violet-400 opacity-100'
                    )}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={timeRange === 'day' ? beatsData : cumulativeData}
              margin={{ top: 16, right: 8, left: 8, bottom: 32 }}
              className="animate-in fade-in duration-300"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
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
                        opacity={0.9}
                        fontSize={11}
                        className="dark:text-zinc-100 font-medium"
                      >
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
                height={40}
                className="dark:text-zinc-100"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: 'currentColor',
                  opacity: 0.5,
                  className: 'dark:text-zinc-100/50 font-medium',
                }}
                domain={[0, yAxisMax]}
                dx={-8}
                tickCount={Math.min(yAxisMax + 1, 5)}
                className="dark:text-zinc-100/50 font-medium"
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                strokeOpacity={0.05}
                vertical={false}
                horizontal={true}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(124, 58, 237, 0.1)' }}
                position={{ x: 0, y: 0 }}
                offset={0}
                wrapperStyle={{ pointerEvents: 'none' }}
                cursorStyle={{ stroke: 'rgba(124, 58, 237, 0.1)' }}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 8,
                  border: 'none',
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Line
                type="monotone"
                dataKey={timeRange === 'day' ? 'value' : 'cumulative'}
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                dot={false}
                activeDot={false}
                animationDuration={500}
                className="transition-all duration-500 ease-in-out"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

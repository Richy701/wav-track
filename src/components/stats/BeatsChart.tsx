import { useEffect, useState, useCallback, useMemo, memo } from 'react'
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
import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'

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

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date?: string;
      label: string;
      value: number;
    };
  }>;
  label?: string;
}

// Memoize the CustomTooltip component
const CustomTooltip = memo(({ active, payload }: CustomTooltipProps) => {
  const formattedDate = useMemo(() => {
    if (!active || !payload || !payload.length) return '';
    
    const data = payload[0].payload;
    if (!data.date) return data.label;
    
    try {
      // Parse the UTC date string and convert to local time
      const [year, month, day] = data.date.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return format(date, "EEEE, MMMM d, yyyy", { locale: enGB });
    } catch (e) {
      console.error('Date parsing error:', e);
      return data.label;
    }
  }, [active, payload]);

  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-sm bg-zinc-900/90 border border-zinc-800 px-2 py-1.5 text-[0.65rem] text-zinc-200 shadow-sm backdrop-blur-sm ring-1 ring-violet-500/20 space-y-0.5 transition-all">
      <p className="text-violet-400 font-medium">
        {formattedDate}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
        <span className="text-zinc-300">Beats: {data.value}</span>
      </div>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

export function BeatsChart({ timeRange, projects, selectedProject }: BeatsChartProps) {
  const [beatsData, setBeatsData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedBar, setHighlightedBar] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [chartView, setChartView] = useState<ChartView>('bar')
  const [maxValue, setMaxValue] = useState(0)
  const [yAxisMax, setYAxisMax] = useState(0)

  // Memoize data fetching function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBeatsDataForChart(timeRange, selectedProject?.id);
      setBeatsData(data);
    } catch (error) {
      console.error('Error fetching beats data:', error);
      setBeatsData([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, selectedProject?.id]);

  // Update refreshKey when projects change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [projects, selectedProject]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Memoize chart calculations
  const chartData = useMemo(() => {
    const max = beatsData.length > 0 ? Math.max(...beatsData.map(d => d.value || 0)) : 0;
    const yMax = max === 0 ? 0 : Math.max(1, Math.ceil(max * 1.2));
    
    const cumulative = beatsData.length > 0 ? beatsData.reduce((acc, curr) => {
      const lastValue = acc.length > 0 ? (acc[acc.length - 1]?.cumulative ?? 0) : 0;
      acc.push({
        ...curr,
        cumulative: lastValue + (curr.value || 0),
      });
      return acc;
    }, [] as ChartData[]) : [];

    return {
      maxValue: max,
      yAxisMax: yMax,
      cumulativeData: cumulative,
      hasValidData: beatsData.length > 0,
    };
  }, [beatsData]);

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

  // Add logging for render conditions
  useEffect(() => {
    console.log('Chart render conditions:', {
      isLoading,
      beatsDataLength: beatsData.length,
      beatsData,
      maxValue,
      yAxisMax,
      hasValidData: chartData.hasValidData,
      cumulativeDataLength: chartData.cumulativeData.length,
      cumulativeData: chartData.cumulativeData,
      chartView,
      timeRange
    })
  }, [isLoading, beatsData, maxValue, yAxisMax, chartData.hasValidData, chartData.cumulativeData, chartView, timeRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    )
  }

  // If there's no data or invalid data, show a message
  if (!chartData.hasValidData) {
    console.log('No valid data to display:', {
      beatsDataLength: beatsData.length,
      hasValidData: chartData.hasValidData,
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
    cumulativeData: chartData.cumulativeData,
    timeRange,
    displayData: chartView === 'bar' ? beatsData : chartData.cumulativeData
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
              className="animate-in fade-in duration-300 z-10 relative"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={1} />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.6} />
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
              data={timeRange === 'day' ? beatsData : chartData.cumulativeData}
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

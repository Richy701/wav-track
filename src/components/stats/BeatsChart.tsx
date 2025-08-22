import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  LabelList,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getOptimizedBeatsDataForChart, getBeatsCreatedByProject } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { enGB } from 'date-fns/locale'

type ChartView = 'bar' | 'line' | 'pie'

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

// Chart configuration for shadcn/ui with violet theme colors
const chartConfig = {
  value: {
    label: "Beats",
    color: "hsl(262 83% 58%)", // violet-500
  },
  cumulative: {
    label: "Total Beats", 
    color: "hsl(258 90% 66%)", // violet-400
  },
  // Pie chart segment colors
  segment1: {
    label: "Period 1",
    color: "hsl(262 83% 58%)", // violet-500
  },
  segment2: {
    label: "Period 2", 
    color: "hsl(258 90% 66%)", // violet-400
  },
  segment3: {
    label: "Period 3",
    color: "hsl(251 91% 73%)", // violet-300
  },
  segment4: {
    label: "Period 4",
    color: "hsl(270 95% 75%)", // violet-200
  },
  segment5: {
    label: "Period 5",
    color: "hsl(276 100% 85%)", // violet-100
  },
} satisfies ChartConfig

export function BeatsChart({ timeRange, projects, selectedProject }: BeatsChartProps) {
  const [beatsData, setBeatsData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightedBar, setHighlightedBar] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [chartView, setChartView] = useState<ChartView>('bar')
  const [maxValue, setMaxValue] = useState(0)
  const [yAxisMax, setYAxisMax] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)

  // Memoize data fetching function
  const fetchData = useCallback(async () => {
    console.log('[Debug] BeatsChart: Starting data fetch for', { timeRange, projectId: selectedProject?.id });
    setIsLoading(true);
    setError(null);
    setIsTimeout(false);
    
    // Add timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        setIsTimeout(true);
        reject(new Error('Chart data fetch timeout'));
      }, 8000); // Reduced to 8 second timeout
    });

    try {
      const dataPromise = getOptimizedBeatsDataForChart(timeRange, selectedProject?.id);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      console.log('[Debug] BeatsChart: Data fetched successfully', { 
        dataLength: data?.length || 0, 
        data: data?.slice(0, 3) // Log first 3 items
      });
      
      setBeatsData(data || []);
    } catch (error) {
      console.error('[Debug] BeatsChart: Error fetching beats data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load chart data';
      setError(errorMessage);
      setBeatsData([]);
    } finally {
      console.log('[Debug] BeatsChart: Setting loading to false');
      setIsLoading(false);
    }
  }, [timeRange, selectedProject?.id]);

  // Only update refreshKey when selectedProject ID actually changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [selectedProject?.id]); // Remove projects dependency to reduce re-renders

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

    // Prepare pie chart data - group data into segments
    const pieData = beatsData.length > 0 ? beatsData.slice(0, 5).map((item, index) => ({
      period: item.label,
      beats: item.value,
      fill: `var(--color-segment${index + 1})`,
    })) : [];

    return {
      maxValue: max,
      yAxisMax: yMax,
      cumulativeData: cumulative,
      pieData,
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

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
        <p className="text-sm text-red-500">Failed to load chart data</p>
        <p className="text-xs">{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading || isTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        {isTimeout && (
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">Taking longer than expected...</p>
            <button
              onClick={() => {
                setIsTimeout(false);
                fetchData();
              }}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Cancel & Retry
            </button>
          </div>
        )}
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

  // Calculate trend
  const totalBeats = useMemo(() => {
    return beatsData.reduce((sum, item) => sum + (item.value || 0), 0)
  }, [beatsData])

  const trendPercentage = useMemo(() => {
    // Simple mock trend calculation - you can implement actual logic
    return totalBeats > 5 ? 12.5 : -5.2
  }, [totalBeats])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">Beat Production</CardTitle>
          <CardDescription>
            {timeRange === 'day' ? 'Daily' : timeRange === 'week' ? 'Weekly' : 'Yearly'} beat creation activity
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartView('bar')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartView === 'bar'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            aria-label="Switch to bar chart view"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartView('line')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartView === 'line'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            aria-label="Switch to line chart view"
          >
            <LineChartIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChartView('pie')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartView === 'pie'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
            aria-label="Switch to pie chart view"
          >
            <PieChartIcon className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={chartView === 'pie' ? '[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]' : ''}>
          {chartView === 'bar' ? (
            <BarChart
              accessibilityLayer
              data={beatsData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={8} />
            </BarChart>
          ) : chartView === 'line' ? (
            <LineChart
              accessibilityLayer
              data={timeRange === 'day' ? beatsData : chartData.cumulativeData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey={timeRange === 'day' ? 'value' : 'cumulative'}
                type="natural"
                stroke={timeRange === 'day' ? "var(--color-value)" : "var(--color-cumulative)"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="beats" hideLabel />}
              />
              <Pie data={chartData.pieData} dataKey="beats">
                <LabelList
                  dataKey="period"
                  className="fill-background"
                  stroke="none"
                  fontSize={12}
                  formatter={(value: string) => value.slice(0, 3)}
                />
              </Pie>
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {trendPercentage >= 0 ? 'up' : 'down'} by {Math.abs(trendPercentage)}% this {timeRange}
          {trendPercentage >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total beats for the selected {timeRange} period
        </div>
      </CardFooter>
    </Card>
  )
}

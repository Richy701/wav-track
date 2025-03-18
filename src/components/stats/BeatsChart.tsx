import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LabelList, LineChart, Line, TooltipProps } from 'recharts';
import { getBeatsDataForChart, getBeatsCreatedByProject } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

type ChartView = 'bar' | 'line';

interface BeatsChartProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  projects: Project[];
  selectedProject?: Project | null;
}

type ChartData = {
  label: string;
  value: number;
  cumulative?: number;
};

export function BeatsChart({ timeRange, projects, selectedProject }: BeatsChartProps) {
  const [beatsData, setBeatsData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedBar, setHighlightedBar] = useState<string | null>(null);
  const [chartView, setChartView] = useState<ChartView>('bar');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Calculate max value for YAxis domain
  const maxValue = Math.max(...beatsData.map(d => d.value));
  const yAxisMax = maxValue === 0 ? 0 : Math.max(1, Math.ceil(maxValue * 1.2));

  // Calculate cumulative data for line chart
  const cumulativeData = beatsData.reduce((acc, curr) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1]?.cumulative ?? 0 : 0;
    acc.push({
      ...curr,
      cumulative: lastValue + curr.value
    });
    return acc;
  }, [] as ChartData[]);

  // Update refreshKey when projects change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [projects]);

  // Fetch data when timeRange, project selection, or refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [timeRange, selectedProject, refreshKey]);

  const CustomTooltip = ({ 
    active, 
    payload, 
    label, 
    ...props
  }: TooltipProps<number, string> & { isHighlighted?: boolean }) => {
    if (active && payload && payload.length) {
      const isHighlighted = props.isHighlighted;
      return (
        <div className={cn(
          "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3",
          "animate-in fade-in zoom-in duration-200",
          isHighlighted && "ring-2 ring-violet-500 dark:ring-violet-400"
        )}>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {payload[0].value}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  // If there's no data, show a message
  if (beatsData.length === 0 || maxValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">No beats recorded yet</p>
        <p className="text-xs mt-1">Create a beat to see your activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-end px-4">
        <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-full">
          <button
            onClick={() => setChartView('bar')}
            className={cn(
              "p-1.5 rounded-full transition-all",
              chartView === 'bar' 
                ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm" 
                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            )}
            title="Bar chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartView('line')}
            className={cn(
              "p-1.5 rounded-full transition-all",
              chartView === 'line'
                ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            )}
            title="Line chart"
          >
            <LineChartIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full relative group">
        <style>
          {`
            .recharts-bar-rectangle {
              transition: opacity 0.2s ease;
            }
            .recharts-bar-rectangle:hover {
              opacity: 0.8;
            }
            .recharts-tooltip-wrapper {
              transition: transform 0.2s ease, opacity 0.2s ease;
            }
          `}
        </style>
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'bar' ? (
            <BarChart 
              data={beatsData} 
              margin={{ top: 16, right: 16, left: 8, bottom: 24 }}
              barGap={8}
              className="animate-in fade-in duration-300"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.35} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="currentColor"
                opacity={0.1}
                className="dark:stroke-zinc-300/20"
              />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                interval={timeRange === 'month' ? 3 : timeRange === 'day' ? 2 : 0}
                tick={(props) => {
                  const { x, y, payload } = props;
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
                  );
                }}
                height={40}
                className="dark:text-zinc-100"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 11, 
                  fill: 'currentColor', 
                  opacity: 0.9,
                  className: "dark:text-zinc-100 font-medium"
                }}
                domain={[0, yAxisMax]}
                dx={-8}
                tickCount={Math.min(yAxisMax + 1, 5)}
                className="dark:text-zinc-100 font-medium"
              />
              <Tooltip 
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={cn(
                        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3",
                        "animate-in fade-in zoom-in duration-200",
                        label === highlightedBar && "ring-2 ring-violet-500 dark:ring-violet-400"
                      )}>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {payload[0].value}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]} 
                barSize={timeRange === 'year' ? 16 : 32}
                animationDuration={300}
                className="transition-all duration-300 hover:filter hover:brightness-110"
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                {beatsData.map((entry, index) => (
                  <LabelList 
                    key={entry.label}
                    dataKey="value"
                    position="top"
                    fill={entry.label === highlightedBar 
                      ? "rgb(139, 92, 246)"
                      : "currentColor"}
                    fontSize={entry.label === highlightedBar ? 12 : 10}
                    className={cn(
                      "transition-all duration-300 dark:text-zinc-100 font-medium",
                      entry.label === highlightedBar && "font-semibold text-violet-500 dark:text-violet-400 opacity-100"
                    )}
                    formatter={(value: number) => (value > 0 ? value : '')}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={cumulativeData}
              margin={{ top: 16, right: 16, left: 8, bottom: 16 }}
              className="animate-in fade-in duration-300"
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                opacity={0.1}
                className="dark:stroke-zinc-300/20"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={timeRange === 'month' ? 3 : timeRange === 'day' ? 2 : 0}
                tick={(props) => {
                  const { x, y, payload } = props;
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
                  );
                }}
                height={40}
                className="dark:text-zinc-100"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.9 }}
                dx={-8}
                tickCount={Math.min(Math.max(...cumulativeData.map(d => d.cumulative || 0)) + 1, 5)}
                className="dark:text-zinc-100 font-medium"
              />
              <Tooltip content={CustomTooltip} />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 5, 
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: 'white',
                  className: "dark:stroke-zinc-900 drop-shadow-md transition-all duration-200"
                }}
                className="transition-all duration-200"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

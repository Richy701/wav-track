import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LabelList, LineChart, Line, TooltipProps } from 'recharts';
import { getBeatsDataForChart } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';
import { ChartBar, LineChart as LineChartIcon } from 'lucide-react';

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
  const [beatsData, setBeatsData] = useState<ChartData[]>(() => {
    const initialData = projects.length > 0 
      ? getBeatsDataForChart(timeRange, selectedProject?.id) 
      : Array(6).fill({ label: '-', value: 0 });
    console.log('Initial chart data:', initialData);
    return initialData;
  });
  const [highlightedBar, setHighlightedBar] = useState<string | null>(null);
  const [chartView, setChartView] = useState<ChartView>('bar');
  
  // Calculate max value for YAxis domain
  const maxValue = Math.max(...beatsData.map(d => d.value));
  const yAxisMax = maxValue === 0 ? 2 : Math.max(2, Math.ceil(maxValue * 1.2));

  // Calculate cumulative data for line chart
  const cumulativeData = beatsData.reduce((acc, curr) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({
      ...curr,
      cumulative: lastValue + curr.value
    });
    return acc;
  }, [] as ChartData[]);

  // Update data when beats are added or project selection changes
  useEffect(() => {
    console.log('BeatsChart effect running - updating data');
    const newData = projects.length > 0 
      ? getBeatsDataForChart(timeRange, selectedProject?.id) 
      : Array(6).fill({ label: '-', value: 0 });
    console.log('New chart data:', newData);
    setBeatsData(newData);

    // If the latest data point has changed, highlight it
    const latestOldValue = beatsData[beatsData.length - 1]?.value;
    const latestNewValue = newData[newData.length - 1]?.value;
    
    console.log('Comparing values:', { latestOldValue, latestNewValue });
    
    if (latestNewValue > latestOldValue) {
      setHighlightedBar(newData[newData.length - 1].label);
      setTimeout(() => setHighlightedBar(null), 2000); // Remove highlight after 2s
    }
  }, [timeRange, projects, selectedProject]);

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
          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-3",
          "animate-in fade-in zoom-in duration-200",
          isHighlighted && "ring-2 ring-violet-500 dark:ring-violet-500"
        )}>
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
            {payload[0].value}
          </div>
        </div>
      );
    }
    return null;
  };

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
            <ChartBar className="w-4 h-4" />
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
                opacity={0.05}
                className="dark:stroke-violet-500"
              />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                interval={0}
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
                        opacity={0.5}
                        fontSize={11}
                        className="dark:text-zinc-400 font-medium"
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
                height={40}
                className="dark:text-zinc-400"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                domain={[0, yAxisMax]}
                dx={-8}
                tickCount={Math.min(yAxisMax + 1, 5)}
                className="dark:text-zinc-400 font-medium"
              />
              <Tooltip 
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className={cn(
                        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-3",
                        "animate-in fade-in zoom-in duration-200",
                        label === highlightedBar && "ring-2 ring-violet-500 dark:ring-violet-500"
                      )}>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
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
                      "transition-all duration-300 opacity-50 dark:text-zinc-400 font-medium",
                      entry.label === highlightedBar && "font-semibold text-violet-500 opacity-100"
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
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                opacity={0.1}
                className="dark:stroke-violet-500"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={0}
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
                        opacity={0.7}
                        fontSize={12}
                        className="dark:text-zinc-400"
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
                height={40}
                className="dark:text-zinc-400"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }}
                dx={-8}
                tickCount={Math.min(Math.max(...cumulativeData.map(d => d.cumulative || 0)) + 1, 5)}
                className="dark:text-zinc-400"
              />
              <Tooltip content={CustomTooltip} />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  fill: '#8b5cf6',
                  strokeWidth: 2,
                  stroke: '#fff',
                  className: "transition-all duration-200"
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

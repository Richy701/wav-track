"use client";

import { Activity, ArrowUpRight, Plus, Target, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Metric {
  label: string;
  value: string;
  trend: number;
  unit?: "cal" | "min" | "hrs" | "days";
}

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface ActivityCardProps {
  category?: string;
  title?: string;
  metrics?: Metric[];
  dailyGoals?: Goal[];
  onAddGoal?: () => void;
  onToggleGoal?: (goalId: string) => void;
  onViewDetails?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const METRIC_COLORS = {
  // Progress Card
  Goals: "#8B5CF6", // purple-500
  Streak: "#EC4899", // pink-500
  "Avg Time": "#6366F1", // indigo-500
  
  // Goals Card
  Active: "#10B981", // emerald-500
  Total: "#059669", // emerald-600
  
  // AI Coach Card
  Tips: "#3B82F6", // blue-500
  Insights: "#2563EB", // blue-600
  
  // Default colors
  Move: "#FF2D55",
  Exercise: "#2CD758",
  Stand: "#007AFF",
} as const;

export function ActivityCard({
  category = "Activity",
  title = "Today's Progress",
  metrics = [],
  dailyGoals = [],
  onAddGoal,
  onToggleGoal,
  onViewDetails,
  className,
  icon
}: ActivityCardProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const handleGoalToggle = (goalId: string) => {
    onToggleGoal?.(goalId);
  };

  return (
    <div
      className={cn(
        "relative h-full rounded-3xl p-6",
        "bg-white dark:bg-black/5",
        "border border-zinc-200 dark:border-zinc-800",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
        "transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
          {icon || <Activity className="w-5 h-5 text-[#FF2D55]" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {category}
          </p>
        </div>
      </div>

      {/* Metrics Rings */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="relative flex flex-col items-center"
            onMouseEnter={() => setIsHovering(metric.label)}
            onMouseLeave={() => setIsHovering(null)}
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800/50" />
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-4 transition-all duration-500",
                  isHovering === metric.label && "scale-105"
                )}
                style={{
                  borderColor: METRIC_COLORS[metric.label as keyof typeof METRIC_COLORS],
                  clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">
                  {metric.value}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {metric.unit}
                </span>
              </div>
            </div>
            <span className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {metric.label}
            </span>
            <span className="text-xs text-zinc-500">
              {metric.trend.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* Goals Section */}
      <div className="mt-8 space-y-6">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Target className="w-4 h-4" />
              Today's Goals
            </h4>
                          <button
                type="button"
                onClick={onAddGoal}
                aria-label="Add new goal"
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
          </div>

          <div className="space-y-2">
            {dailyGoals.map((goal) => (
                              <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  aria-label={`Toggle goal: ${goal.title}`}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl",
                    "bg-zinc-50 dark:bg-zinc-900/50",
                    "border border-zinc-200/50 dark:border-zinc-800/50",
                    "hover:border-zinc-300/50 dark:hover:border-zinc-700/50",
                    "transition-all"
                  )}
              >
                <CheckCircle2
                  className={cn(
                    "w-5 h-5",
                    goal.isCompleted
                      ? "text-emerald-500"
                      : "text-zinc-400 dark:text-zinc-600"
                  )}
                />
                <span
                  className={cn(
                    "text-sm text-left",
                    goal.isCompleted
                      ? "text-zinc-500 dark:text-zinc-400 line-through"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {goal.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <button
              onClick={onViewDetails}
              aria-label="View activity details"
              className="inline-flex items-center gap-2 text-sm font-medium
                text-zinc-600 hover:text-zinc-900 
                dark:text-zinc-400 dark:hover:text-white
                transition-colors duration-200"
          >
            View Activity Details
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 
import { Activity, Target, Brain, Flame, Trophy, Timer, Calendar, CheckCircle2, Music, Lightbulb, Goal as GoalIcon, ListTodo } from "lucide-react";
import { ActivityCard } from "@/components/ui/activity-card";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  goal_text: string;
  status: "pending" | "completed";
}

interface SessionStatsCardProps {
  stats: {
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
    averageSessionTime: number;
    mostProductiveDay: string | null;
    totalSessions: number;
  };
  className?: string;
}

export function SessionStatsCard({ stats, className }: SessionStatsCardProps) {
  // Calculate percentages and round to whole numbers
  const completionRate = Math.round((stats.completedGoals / Math.max(1, stats.totalGoals)) * 100);
  const streakPercentage = Math.round((stats.currentStreak / Math.max(1, stats.bestStreak)) * 100);
  const avgTimePercentage = Math.round((stats.averageSessionTime / 60) * 100); // As percentage of an hour

  return (
    <ActivityCard
      category="Your Progress"
      title="Weekly Overview"
      icon={<Trophy className="w-5 h-5 text-purple-500" />}
      metrics={[
        {
          label: "Goals",
          value: `${stats.completedGoals}/${stats.totalGoals}`,
          trend: completionRate,
          unit: undefined
        },
        {
          label: "Streak",
          value: `${stats.currentStreak}`,
          trend: streakPercentage,
          unit: "days"
        },
        {
          label: "Avg Time",
          value: `${stats.averageSessionTime}`,
          trend: avgTimePercentage,
          unit: "min"
        }
      ]}
      dailyGoals={[
        {
          id: "streak",
          title: `${stats.currentStreak} day streak`,
          isCompleted: stats.currentStreak > 0
        },
        {
          id: "completion",
          title: `${completionRate}% completion rate`,
          isCompleted: completionRate >= 80
        },
        {
          id: "sessions",
          title: `${stats.totalSessions} total sessions`,
          isCompleted: stats.totalSessions > 0
        }
      ]}
      className={cn(
        "rounded-xl p-6 sm:p-8 h-full",
        "bg-white dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-violet-500/5",
        "hover:from-purple-500/10 hover:to-violet-500/10",
        "border-purple-500/20 hover:border-purple-500/30",
        "transition-all duration-300",
        className
      )}
    />
  );
}

interface SessionGoalsCardProps {
  goals: Goal[];
  onAddGoal: () => void;
  onToggleGoal: (goalId: string) => void;
  className?: string;
}

export function SessionGoalsCard({ goals, onAddGoal, onToggleGoal, className }: SessionGoalsCardProps) {
  const activeGoals = goals.filter(g => g.status === "pending");
  const completedGoals = goals.filter(g => g.status === "completed");
  const totalGoals = goals.length;
  
  // Calculate percentages and round to whole numbers
  const activePercentage = Math.round((activeGoals.length / Math.max(1, totalGoals)) * 100);
  const completionRate = Math.round((completedGoals.length / Math.max(1, totalGoals)) * 100);
  
  return (
    <ActivityCard
      category="Session Goals"
      title="Today's Goals"
      icon={<ListTodo className="w-5 h-5 text-emerald-500" />}
      metrics={[
        {
          label: "Active",
          value: `${activeGoals.length}`,
          trend: activePercentage,
          unit: undefined
        },
        {
          label: "Total",
          value: `${totalGoals}`,
          trend: completionRate,
          unit: undefined
        }
      ]}
      dailyGoals={activeGoals.slice(0, 3).map(goal => ({
        id: goal.id,
        title: goal.goal_text,
        isCompleted: goal.status === "completed"
      }))}
      onAddGoal={onAddGoal}
      onToggleGoal={onToggleGoal}
      className={cn(
        "rounded-xl p-6 sm:p-8 h-full",
        "bg-gradient-to-br from-emerald-500/5 to-teal-500/5",
        "hover:from-emerald-500/10 hover:to-teal-500/10",
        "border-emerald-500/20 hover:border-emerald-500/30",
        "transition-all duration-300",
        className
      )}
    />
  );
}

interface EnhancedAICoachCardProps {
  suggestions: Array<{
    type: string;
    content: string;
    priority: string;
    category: string;
    context: string;
    tags: string[];
  }>;
  onViewDetails: () => void;
  className?: string;
}

export function EnhancedAICoachCard({ suggestions, onViewDetails, className }: EnhancedAICoachCardProps) {
  const tipCount = suggestions.filter(s => s.type === "tip").length;
  const insightCount = suggestions.filter(s => s.type === "insight").length;
  const totalCount = suggestions.length;
  
  // Calculate percentages and round to whole numbers
  const tipPercentage = Math.round((tipCount / Math.max(1, totalCount)) * 100);
  const insightPercentage = Math.round((insightCount / Math.max(1, totalCount)) * 100);
  
  return (
    <ActivityCard
      category="AI Coach"
      title="Suggestions"
      icon={<Brain className="w-5 h-5 text-blue-500" />}
      metrics={[
        {
          label: "Tips",
          value: `${tipCount}`,
          trend: tipPercentage,
          unit: undefined
        },
        {
          label: "Insights",
          value: `${insightCount}`,
          trend: insightPercentage,
          unit: undefined
        }
      ]}
      dailyGoals={suggestions.slice(0, 3).map((suggestion, index) => ({
        id: `suggestion-${index}`,
        title: suggestion.content,
        isCompleted: false
      }))}
      onViewDetails={onViewDetails}
      className={cn(
        "rounded-xl p-6 sm:p-8 h-full",
        "bg-gradient-to-br from-blue-500/5 to-indigo-500/5",
        "hover:from-blue-500/10 hover:to-indigo-500/10",
        "border-blue-500/20 hover:border-blue-500/30",
        "transition-all duration-300",
        className
      )}
    />
  );
}
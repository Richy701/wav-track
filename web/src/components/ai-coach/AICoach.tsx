import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Track } from '@/types/track'
import { analyzeUserBehavior, generateRecommendations } from '@/lib/ai-coach'
import { AICoachCard } from './AICoachCard'
import { Skeleton } from '../ui/skeleton'
import { FadeIn } from '../ui/fade-in'
import { Brain, Info, Target, BarChart, Clock, Zap, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useProjects } from '@/hooks/useProjects'

interface AICoachProps {
  tracks: Track[]
  className?: string
}

const categoryStyles = {
  'Active Projects Status': {
    icon: Target,
    accent: "border-l-emerald-500/50 dark:border-l-emerald-500/30",
    glow: "hover:shadow-[0_0_12px_rgba(34,197,94,0.15)] dark:hover:shadow-[0_0_12px_rgba(34,197,94,0.1)]",
    gradient: "from-emerald-50/50 via-emerald-50/30 to-emerald-50/10 dark:from-emerald-500/5 dark:via-emerald-500/[0.02] dark:to-emerald-500/[0.01]"
  },
  'Weekly Progress': {
    icon: BarChart,
    accent: "border-l-indigo-500/50 dark:border-l-indigo-500/30",
    glow: "hover:shadow-[0_0_12px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_0_12px_rgba(99,102,241,0.1)]",
    gradient: "from-indigo-50/50 via-indigo-50/30 to-indigo-50/10 dark:from-indigo-500/5 dark:via-indigo-500/[0.02] dark:to-indigo-500/[0.01]"
  },
  'Workflow Enhancement': {
    icon: Clock,
    accent: "border-l-amber-500/50 dark:border-l-amber-500/30",
    glow: "hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_12px_rgba(245,158,11,0.1)]",
    gradient: "from-amber-50/50 via-amber-50/30 to-amber-50/10 dark:from-amber-500/5 dark:via-amber-500/[0.02] dark:to-amber-500/[0.01]"
  },
  'Optimize Your Sessions': {
    icon: Zap,
    accent: "border-l-purple-500/50 dark:border-l-purple-500/30",
    glow: "hover:shadow-[0_0_12px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_12px_rgba(168,85,247,0.1)]",
    gradient: "from-purple-50/50 via-purple-50/30 to-purple-50/10 dark:from-purple-500/5 dark:via-purple-500/[0.02] dark:to-purple-500/[0.01]"
  },
  'Creative Flow Insights': {
    icon: Layers,
    accent: "border-l-blue-500/50 dark:border-l-blue-500/30",
    glow: "hover:shadow-[0_0_12px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_12px_rgba(59,130,246,0.1)]",
    gradient: "from-blue-50/50 via-blue-50/30 to-blue-50/10 dark:from-blue-500/5 dark:via-blue-500/[0.02] dark:to-blue-500/[0.01]"
  }
}

const cardStyles = {
  base: "relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-background/80 dark:via-background/60 dark:to-background/40 backdrop-blur-xl rounded-lg sm:rounded-xl border border-border/50 shadow-[0_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_1px_1px_rgba(255,255,255,0.025)]",
  hover: "hover:scale-[1.01] transform transition-all duration-200 ease-in-out",
  padding: "p-4 sm:p-5 lg:p-6",
  innerCard: "relative z-10",
  accent: "border-l-4",
  highlight: "after:absolute after:inset-0 after:bg-gradient-to-br after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200"
}

const textStyles = {
  title: "text-lg sm:text-xl font-semibold tracking-tight text-foreground dark:text-foreground/90",
  subtitle: "text-sm sm:text-base font-medium text-muted-foreground dark:text-muted-foreground/80",
  body: "text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground/80"
}

const tooltipContent = {
  productivity: "AI analyzes your session patterns and completion rates to provide personalized productivity tips.",
  focus: "Based on your most productive time periods and session durations.",
  technique: "Generated from analysis of your completed tracks and production style.",
  goals: "Suggestions derived from your historical progress and current objectives."
}

export function AICoach() {
  const { data: projects = [] } = useProjects()
  
  const { data: recommendations = [] } = useQuery({
    queryKey: ['ai-coach-recommendations', projects.length],
    queryFn: () => {
      // Convert projects to tracks
      const tracks: Track[] = projects.map(project => ({
        id: project.id,
        title: project.title,
        artist: project.artist || 'Unknown Artist',
        genre: project.genre || '',
        duration: project.duration || '0:00',
        status: project.status === 'completed' ? 'completed' : 'in_progress',
        created_at: project.created_at || new Date().toISOString(),
        user_id: project.user_id,
        cover_art: project.cover_art,
        notes: project.notes,
        last_modified: project.last_modified || project.created_at || new Date().toISOString()
      }))
      
      const behavior = analyzeUserBehavior(tracks)
      return generateRecommendations(behavior)
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary/80" />
          <h2 className="text-xl font-semibold text-foreground dark:text-white">AI Productivity Coach</h2>
        </div>
      </div>
      
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => {
            const category = categoryStyles[recommendation.title as keyof typeof categoryStyles] || categoryStyles['Active Projects Status']
            const Icon = category.icon
            
            return (
              <AICoachCard
                key={recommendation.title}
                title={recommendation.title}
                description={recommendation.description}
                priority={recommendation.priority}
                actionItems={recommendation.actionItems}
                icon={<Icon className="w-5 h-5" />}
                className={cn(
                  cardStyles.base,
                  cardStyles.hover,
                  cardStyles.padding,
                  cardStyles.accent,
                  category.accent,
                  category.glow,
                  "bg-gradient-to-br",
                  category.gradient
                )}
                onComplete={() => {
                  console.log('Completed:', recommendation.title)
                }}
              />
            )
          })}
        </div>
      </AnimatePresence>
    </div>
  )
} 
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Track } from '@/types/track'
import { analyzeUserBehavior, generateRecommendations } from '@/lib/ai-coach'
import { AICoachCard } from './AICoachCard'
import { Brain, Target, BarChart, Clock, Zap, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'

interface AICoachProps {
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



export function AICoach() {
  const { allProjects: projects = [], isLoading: projectsLoading } = useProjects()
  const { user } = useAuth()
  
  const { data: recommendations = [], isLoading: recommendationsLoading, error } = useQuery({
    queryKey: ['ai-coach-recommendations', user?.id, projects.length],
    queryFn: () => {
      console.log('AICoach: Generating recommendations for', projects.length, 'projects')
      
      // Convert projects to tracks
      const tracks: Track[] = projects.map(project => ({
        id: project.id,
        title: project.title,
        artist: 'Unknown Artist',
        genre: project.genre || '',
        duration: '0:00',
        status: project.status === 'completed' ? 'completed' : 'in_progress',
        created_at: project.created_at || new Date().toISOString(),
        user_id: project.user_id,
        notes: '',
        last_modified: project.last_modified || project.created_at || new Date().toISOString()
      }))
      
      const behavior = analyzeUserBehavior(tracks)
      const recommendations = generateRecommendations(behavior)
      console.log('AICoach: Generated', recommendations.length, 'recommendations')
      
      // If no recommendations were generated, provide some default ones
      if (recommendations.length === 0) {
        return [
          {
            type: 'goal' as const,
            title: 'Active Projects Status',
            description: 'You\'re just getting started! Create your first project to begin your music production journey.',
            priority: 'high' as const,
            actionItems: [
              'Create your first project',
              'Set a realistic goal for completion',
              'Start with a simple beat or melody'
            ]
          },
          {
            type: 'habit' as const,
            title: 'Workflow Enhancement',
            description: 'Establish good habits early in your production journey.',
            priority: 'medium' as const,
            actionItems: [
              'Set aside dedicated time for music production',
              'Create a comfortable workspace',
              'Keep your projects organized'
            ]
          }
        ]
      }
      
      return recommendations
    },
    enabled: !!user && !projectsLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1
  })

  console.log('AICoach Debug:', {
    user: !!user,
    userId: user?.id,
    projectsLoading,
    recommendationsLoading,
    projectsCount: projects.length,
    recommendationsCount: recommendations.length,
    error: error?.message,
    enabled: !!user && !projectsLoading
  })

  // Show loading state
  if (projectsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary/80" />
            <h2 className="text-xl font-semibold text-foreground dark:text-white">AI Productivity Coach</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show message when not authenticated
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary/80" />
            <h2 className="text-xl font-semibold text-foreground dark:text-white">AI Productivity Coach</h2>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-muted-foreground dark:text-muted-foreground/80">
            Sign in to get personalized AI recommendations for your music production!
          </p>
        </div>
      </div>
    )
  }

  // Show fallback recommendations if query is taking too long
  if (recommendationsLoading && recommendations.length === 0) {
    const fallbackRecommendations = [
      {
        type: 'goal' as const,
        title: 'Active Projects Status',
        description: 'You\'re just getting started! Create your first project to begin your music production journey.',
        priority: 'high' as const,
        actionItems: [
          'Create your first project',
          'Set a realistic goal for completion',
          'Start with a simple beat or melody'
        ]
      },
      {
        type: 'habit' as const,
        title: 'Workflow Enhancement',
        description: 'Establish good habits early in your production journey.',
        priority: 'medium' as const,
        actionItems: [
          'Set aside dedicated time for music production',
          'Create a comfortable workspace',
          'Keep your projects organized'
        ]
      }
    ]

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
            {fallbackRecommendations.map((recommendation, index) => {
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

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary/80" />
            <h2 className="text-xl font-semibold text-foreground dark:text-white">AI Productivity Coach</h2>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Unable to generate recommendations. Please try again later.
          </p>
        </div>
      </div>
    )
  }

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
          {recommendations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground dark:text-muted-foreground/80">
                Start creating projects to get personalized AI recommendations!
              </p>
            </div>
          ) : (
            recommendations.map((recommendation, index) => {
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
            })
          )}
        </div>
      </AnimatePresence>
    </div>
  )
} 
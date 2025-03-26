import { Track } from '@/types/track'

interface UserBehavior {
  totalBeats: number
  averageBeatsPerMonth: number
  mostProductiveDay: string
  mostProductiveTime: string
  completionRate: number
  weeklyGoals: {
    completed: number
    total: number
  }
  sessionGoal?: string
  // Enhanced metrics
  averageSessionDuration: number
  preferredBPMRange: {
    min: number
    max: number
  }
  activeProjects: number
  recentActivity: {
    lastWeekSessions: number
    averageSessionsPerDay: number
    totalActiveTime: number
  }
  workPatterns: {
    focusedSessionDuration: number
    breakFrequency: number
    projectSwitchRate: number
  }
  audioStats: {
    averageEnergy: number
    commonKey: string
    averageDanceability: number
  }
}

interface Recommendation {
  type: 'goal' | 'improvement' | 'habit'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionItems: string[]
}

export function analyzeUserBehavior(tracks: Track[]): UserBehavior {
  // If no tracks, return default values
  if (!tracks.length) {
    return {
      totalBeats: 0,
      averageBeatsPerMonth: 0,
      mostProductiveDay: 'Monday',
      mostProductiveTime: '10:00',
      completionRate: 0,
      weeklyGoals: {
        completed: 0,
        total: 0
      },
      // Default values for enhanced metrics
      averageSessionDuration: 0,
      preferredBPMRange: {
        min: 120,
        max: 130
      },
      activeProjects: 0,
      recentActivity: {
        lastWeekSessions: 0,
        averageSessionsPerDay: 0,
        totalActiveTime: 0
      },
      workPatterns: {
        focusedSessionDuration: 45,
        breakFrequency: 0,
        projectSwitchRate: 0
      },
      audioStats: {
        averageEnergy: 0,
        commonKey: 'C',
        averageDanceability: 0
      }
    }
  }

  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
  
  // Calculate total beats
  const totalBeats = tracks.length
  
  // Calculate monthly average
  const monthlyBeats = tracks.filter(track => 
    new Date(track.created_at) >= lastMonth
  ).length
  
  // Find most productive day and time
  const dayDistribution = new Map<string, number>()
  const timeDistribution = new Map<string, number>()
  
  tracks.forEach(track => {
    const date = new Date(track.created_at)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    const hour = date.getHours()
    
    dayDistribution.set(day, (dayDistribution.get(day) || 0) + 1)
    timeDistribution.set(hour.toString(), (timeDistribution.get(hour.toString()) || 0) + 1)
  })
  
  // Get most productive day with fallback
  const sortedDays = Array.from(dayDistribution.entries()).sort((a, b) => b[1] - a[1])
  const mostProductiveDay = sortedDays.length > 0 ? sortedDays[0][0] : 'Monday'
  
  // Get most productive hour with fallback
  const sortedHours = Array.from(timeDistribution.entries()).sort((a, b) => b[1] - a[1])
  const mostProductiveHour = sortedHours.length > 0 ? sortedHours[0][0] : '10'
  
  // Calculate completion rate
  const completedTracks = tracks.filter(track => track.status === 'completed').length
  const completionRate = (completedTracks / totalBeats) * 100
  
  // Calculate weekly goals progress
  const completedThisWeek = tracks.filter(track => 
    track.status === 'completed' && new Date(track.created_at) >= lastWeek
  ).length

  // Calculate active projects
  const activeProjects = tracks.filter(track => 
    track.status === 'in_progress'
  ).length

  // Calculate recent activity
  const recentTracks = tracks.filter(track => new Date(track.created_at) >= lastWeek)
  const lastWeekSessions = recentTracks.length

  // Estimate session duration from track duration
  const averageSessionDuration = tracks.reduce((acc, track) => {
    const [minutes = 0] = track.duration.split(':').map(Number)
    return acc + minutes
  }, 0) / tracks.length || 45 // Default to 45 minutes if no duration data

  return {
    totalBeats,
    averageBeatsPerMonth: monthlyBeats,
    mostProductiveDay,
    mostProductiveTime: `${mostProductiveHour}:00`,
    completionRate,
    weeklyGoals: {
      completed: completedThisWeek,
      total: 5
    },
    averageSessionDuration,
    preferredBPMRange: {
      min: 120,
      max: 130
    },
    activeProjects,
    recentActivity: {
      lastWeekSessions,
      averageSessionsPerDay: lastWeekSessions / 7,
      totalActiveTime: lastWeekSessions * averageSessionDuration
    },
    workPatterns: {
      focusedSessionDuration: averageSessionDuration,
      breakFrequency: 2,
      projectSwitchRate: activeProjects > 0 ? lastWeekSessions / activeProjects : 0
    },
    audioStats: {
      averageEnergy: 0.5, // Default since we don't have this data
      commonKey: 'C',
      averageDanceability: 0.5 // Default since we don't have this data
    }
  }
}

export function generateRecommendations(behavior: UserBehavior): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  // 1. Session Optimization
  if (behavior.recentActivity.lastWeekSessions > 0) {
    recommendations.push({
      type: 'habit',
      title: 'Optimize Your Sessions',
      description: `You're averaging ${Math.round(behavior.recentActivity.averageSessionsPerDay)} sessions per day, with ${Math.round(behavior.averageSessionDuration)} minutes per session. Your most productive sessions are on ${behavior.mostProductiveDay}s at ${behavior.mostProductiveTime}.`,
      priority: 'high',
      actionItems: [
        `Schedule focused sessions around ${behavior.mostProductiveTime}`,
        `Aim for ${Math.min(behavior.averageSessionDuration + 15, 90)} minute sessions`,
        'Take short breaks every 45 minutes'
      ]
    })
  }
  
  // 2. Project Progress
  recommendations.push({
    type: 'goal',
    title: 'Active Projects Status',
    description: `You have ${behavior.activeProjects} active projects, with a ${Math.round(behavior.completionRate)}% completion rate. ${
      behavior.activeProjects > 2 ? 'Consider focusing on fewer projects to maintain momentum.' : 'Good job keeping your workload manageable!'
    }`,
    priority: behavior.activeProjects > 3 ? 'high' : 'medium',
    actionItems: [
      'Review progress on each active project',
      behavior.activeProjects > 2 ? 'Prioritize 2-3 main projects' : 'Maintain current project focus',
      'Update project statuses regularly'
    ]
  })
  
  // 3. Creative Patterns
  if (behavior.audioStats.averageEnergy > 0) {
    recommendations.push({
      type: 'improvement',
      title: 'Creative Flow Insights',
      description: `Your tracks average ${Math.round(behavior.audioStats.averageDanceability * 100)}% danceability and ${Math.round(behavior.audioStats.averageEnergy * 100)}% energy. BPM range: ${behavior.preferredBPMRange.min}-${behavior.preferredBPMRange.max}.`,
      priority: 'medium',
      actionItems: [
        `Explore ${behavior.audioStats.averageEnergy > 0.6 ? 'calmer' : 'more energetic'} compositions`,
        `Try producing in ${behavior.audioStats.commonKey === 'C' ? 'different keys' : behavior.audioStats.commonKey}`,
        'Experiment with tempo variations'
      ]
    })
  }
  
  // 4. Weekly Activity
  recommendations.push({
    type: 'goal',
    title: 'Weekly Progress',
    description: `This week: ${behavior.recentActivity.lastWeekSessions} sessions, ${Math.round(behavior.recentActivity.totalActiveTime / 60)} hours total. ${
      behavior.weeklyGoals.completed >= behavior.weeklyGoals.total 
        ? 'Excellent progress!' 
        : `${behavior.weeklyGoals.total - behavior.weeklyGoals.completed} more to reach your weekly goal.`
    }`,
    priority: 'high',
    actionItems: [
      `Schedule ${Math.max(1, behavior.weeklyGoals.total - behavior.weeklyGoals.completed)} more sessions this week`,
      'Review your most productive time slots',
      'Update your progress tracker'
    ]
  })
  
  // 5. Work Pattern Optimization
  recommendations.push({
    type: 'habit',
    title: 'Workflow Enhancement',
    description: `Your focused work sessions last about ${Math.round(behavior.workPatterns.focusedSessionDuration)} minutes. ${
      behavior.workPatterns.projectSwitchRate > 2 
        ? 'Consider reducing project switching for better focus.' 
        : 'You\'re maintaining good focus on individual projects.'
    }`,
    priority: 'medium',
    actionItems: [
      `Take breaks every ${Math.round(behavior.workPatterns.focusedSessionDuration)} minutes`,
      'Use a timer for focused sessions',
      behavior.workPatterns.projectSwitchRate > 2 ? 'Limit project switching' : 'Maintain your current workflow'
    ]
  })
  
  return recommendations
} 
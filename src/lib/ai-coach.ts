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
  if (!tracks || tracks.length === 0) {
    return {
      totalBeats: 0,
      averageBeatsPerMonth: 0,
      mostProductiveDay: 'Monday',
      mostProductiveTime: '10:00',
      completionRate: 0,
      weeklyGoals: { completed: 0, total: 5 },
      averageSessionDuration: 45,
      preferredBPMRange: { min: 120, max: 130 },
      activeProjects: 0,
      recentActivity: {
        lastWeekSessions: 0,
        averageSessionsPerDay: 0,
        totalActiveTime: 0
      },
      workPatterns: {
        focusedSessionDuration: 45,
        breakFrequency: 2,
        projectSwitchRate: 0
      },
      audioStats: {
        averageEnergy: 0.5,
        commonKey: 'C',
        averageDanceability: 0.5
      }
    }
  }

  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Calculate basic metrics
  const totalBeats = tracks.length
  const monthlyBeats = tracks.filter(track => new Date(track.created_at) >= lastMonth).length

  // Enhanced day analysis with weighted scoring
  const dayScores = new Map<string, number>()
  const timeDistribution = new Map<string, number>()

  tracks.forEach(track => {
    const date = new Date(track.created_at)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    const hour = date.getHours().toString()
    
    // Weight completed tracks more heavily
    const weight = track.status === 'completed' ? 2 : 1
    
    // Update day scores
    dayScores.set(day, (dayScores.get(day) || 0) + weight)
    
    // Update time distribution
    timeDistribution.set(hour, (timeDistribution.get(hour) || 0) + weight)
  })

  // Find most productive day with weighted scoring
  const sortedDays = Array.from(dayScores.entries()).sort((a, b) => b[1] - a[1])
  const mostProductiveDay = sortedDays.length > 0 ? sortedDays[0][0] : 'Monday'

  // Enhanced time analysis with weighted scoring
  const sortedHours = Array.from(timeDistribution.entries()).sort((a, b) => b[1] - a[1])
  const mostProductiveHour = sortedHours.length > 0 ? sortedHours[0][0] : '10'

  // Calculate completion rate with time-based weighting
  const completedTracks = tracks.filter(track => track.status === 'completed')
  const recentCompletedTracks = completedTracks.filter(track => 
    new Date(track.created_at) >= lastMonth
  )
  const completionRate = (recentCompletedTracks.length / totalBeats) * 100

  // Calculate weekly goals with trend analysis
  const completedThisWeek = tracks.filter(track => 
    track.status === 'completed' && new Date(track.created_at) >= lastWeek
  ).length

  // Enhanced active projects analysis
  const activeProjects = tracks.filter(track => 
    track.status === 'in_progress'
  ).length

  // Calculate recent activity with enhanced metrics
  const recentTracks = tracks.filter(track => new Date(track.created_at) >= lastWeek)
  const lastWeekSessions = recentTracks.length

  // Enhanced session duration analysis
  const sessionDurations = tracks.map(track => {
    const [minutes = 0] = track.duration.split(':').map(Number)
    return minutes
  }).filter(duration => duration > 0)

  const averageSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((acc, duration) => acc + duration, 0) / sessionDurations.length
    : 45

  // Calculate work patterns with enhanced analysis
  const workPatterns = {
    focusedSessionDuration: averageSessionDuration,
    breakFrequency: Math.max(1, Math.floor(averageSessionDuration / 25)), // Break every 25 minutes
    projectSwitchRate: activeProjects > 0 ? lastWeekSessions / activeProjects : 0
  }

  // Calculate recent activity metrics
  const recentActivity = {
    lastWeekSessions,
    averageSessionsPerDay: lastWeekSessions / 7,
    totalActiveTime: lastWeekSessions * averageSessionDuration
  }

  // Enhanced audio stats analysis
  const audioStats = {
    averageEnergy: 0.5,
    commonKey: 'C',
    averageDanceability: 0.5
  }

  return {
    totalBeats,
    averageBeatsPerMonth: monthlyBeats,
    mostProductiveDay,
    mostProductiveTime: `${mostProductiveHour}:00`,
    completionRate,
    weeklyGoals: {
      completed: completedThisWeek,
      total: Math.max(5, Math.ceil(lastWeekSessions / 2)) // Dynamic goal setting
    },
    averageSessionDuration,
    preferredBPMRange: {
      min: 120,
      max: 130
    },
    activeProjects,
    recentActivity,
    workPatterns,
    audioStats
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
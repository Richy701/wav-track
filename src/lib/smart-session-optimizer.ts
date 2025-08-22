// Smart Session Optimization with Predictive Analytics
// Enhances existing Pomodoro and session system with ML-powered insights

import { UserBehaviorPattern } from './adaptive-gamification'

// Enhanced session data interface (extends existing)
export interface SmartSessionData {
  id: string
  userId: string
  projectId?: string
  startTime: Date
  endTime?: Date
  duration: number
  sessionType: 'pomodoro' | 'deep-focus' | 'creative' | 'mixing' | 'learning'
  productivity: {
    focusScore: number // 0-100
    outputQuality: number // 0-100
    energyLevel: number // 0-100
    distractionCount: number
    flowStateAchieved: boolean
  }
  environment: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    dayOfWeek: number // 0-6
    ambientNoise: 'quiet' | 'moderate' | 'noisy'
    mood: 'motivated' | 'neutral' | 'tired' | 'stressed'
  }
  outcomes: {
    beatsCreated: number
    projectProgress: number // percentage
    goalsAchieved: string[]
    skillsImproved: string[]
  }
  aiInsights?: {
    successFactors: string[]
    improvementSuggestions: string[]
    optimalNextSessionTime: Date
    recommendedSessionType: SmartSessionData['sessionType']
  }
}

// Predictive analytics for session success
export class SessionSuccessPredictor {
  private readonly SUCCESS_FACTORS = {
    timeOfDay: { morning: 0.8, afternoon: 0.7, evening: 0.6, night: 0.4 },
    sessionLength: { optimal: 60, min: 25, max: 120 },
    energyThreshold: 70,
    focusThreshold: 60
  }

  // Predict session success probability
  predictSessionSuccess(
    plannedSession: {
      startTime: Date
      duration: number
      sessionType: SmartSessionData['sessionType']
      userMood?: string
    },
    userPattern: UserBehaviorPattern,
    recentSessions: SmartSessionData[]
  ): {
    successProbability: number
    confidenceLevel: number
    factors: Array<{ factor: string; impact: number; reason: string }>
    recommendations: string[]
  } {
    const factors: Array<{ factor: string; impact: number; reason: string }> = []
    let baseSuccess = 0.5
    
    // Time of day analysis
    const hourOfDay = plannedSession.startTime.getHours()
    const timeOfDay = this.categorizeTimeOfDay(hourOfDay)
    const timeOptimality = this.calculateTimeOptimality(timeOfDay, userPattern)
    
    baseSuccess += (timeOptimality - 0.5) * 0.3
    factors.push({
      factor: 'Time of Day',
      impact: timeOptimality,
      reason: `${timeOfDay} sessions have ${Math.round(timeOptimality * 100)}% success rate for you`
    })

    // Duration analysis
    const durationOptimality = this.calculateDurationOptimality(plannedSession.duration, userPattern)
    baseSuccess += (durationOptimality - 0.5) * 0.25
    factors.push({
      factor: 'Session Duration',
      impact: durationOptimality,
      reason: `${plannedSession.duration} minutes ${durationOptimality > 0.7 ? 'aligns well' : 'may not align'} with your optimal session length`
    })

    // Recent performance trend
    const recentPerformance = this.analyzeRecentPerformance(recentSessions)
    baseSuccess += (recentPerformance - 0.5) * 0.2
    factors.push({
      factor: 'Recent Performance',
      impact: recentPerformance,
      reason: `Your recent sessions show ${recentPerformance > 0.6 ? 'positive' : 'declining'} productivity trends`
    })

    // Session type alignment
    const typeAlignment = this.calculateSessionTypeAlignment(plannedSession.sessionType, userPattern, timeOfDay)
    baseSuccess += (typeAlignment - 0.5) * 0.15
    factors.push({
      factor: 'Session Type Fit',
      impact: typeAlignment,
      reason: `${plannedSession.sessionType} sessions are ${typeAlignment > 0.6 ? 'well-suited' : 'challenging'} for this time`
    })

    // Day of week analysis
    const dayOfWeek = plannedSession.startTime.getDay()
    const dayOptimality = this.calculateDayOptimality(dayOfWeek, userPattern)
    baseSuccess += (dayOptimality - 0.5) * 0.1
    factors.push({
      factor: 'Day of Week',
      impact: dayOptimality,
      reason: `${this.getDayName(dayOfWeek)} typically shows ${dayOptimality > 0.5 ? 'good' : 'lower'} productivity for you`
    })

    const successProbability = Math.max(0.1, Math.min(0.95, baseSuccess))
    const confidenceLevel = this.calculateConfidenceLevel(recentSessions, userPattern)
    const recommendations = this.generateRecommendations(factors, userPattern, plannedSession)

    return {
      successProbability,
      confidenceLevel,
      factors,
      recommendations
    }
  }

  // Optimize session timing
  findOptimalSessionTime(
    targetDate: Date,
    sessionDuration: number,
    sessionType: SmartSessionData['sessionType'],
    userPattern: UserBehaviorPattern,
    recentSessions: SmartSessionData[]
  ): {
    recommendedTime: Date
    alternatives: Array<{ time: Date; successProbability: number }>
    reasoning: string[]
  } {
    const reasoning: string[] = []
    const alternatives: Array<{ time: Date; successProbability: number }> = []

    // Get user's preferred working hours
    const preferredHours = userPattern.sessionPatterns.preferredWorkingHours
    const peakHour = this.getTimeFromPeriod(userPattern.sessionPatterns.peakProductivityTime)

    // Test different time slots
    const testHours = [
      ...preferredHours,
      peakHour,
      9, 10, 14, 15, 19, 20 // Common productive hours
    ].filter((hour, index, arr) => arr.indexOf(hour) === index) // Remove duplicates

    for (const hour of testHours) {
      const testTime = new Date(targetDate)
      testTime.setHours(hour, 0, 0, 0)

      const prediction = this.predictSessionSuccess(
        { startTime: testTime, duration: sessionDuration, sessionType },
        userPattern,
        recentSessions
      )

      alternatives.push({
        time: testTime,
        successProbability: prediction.successProbability
      })
    }

    // Sort by success probability
    alternatives.sort((a, b) => b.successProbability - a.successProbability)
    
    const recommendedTime = alternatives[0]?.time || new Date(targetDate.setHours(peakHour))

    reasoning.push(`Based on your productivity patterns, ${this.formatTime(recommendedTime)} offers the highest success probability`)
    reasoning.push(`This aligns with your peak productivity time: ${userPattern.sessionPatterns.peakProductivityTime}`)
    
    if (preferredHours.includes(recommendedTime.getHours())) {
      reasoning.push(`This time matches your preferred working hours`)
    }

    return {
      recommendedTime,
      alternatives: alternatives.slice(0, 5), // Top 5 alternatives
      reasoning
    }
  }

  private categorizeTimeOfDay(hour: number): SmartSessionData['environment']['timeOfDay'] {
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  private calculateTimeOptimality(
    timeOfDay: SmartSessionData['environment']['timeOfDay'],
    userPattern: UserBehaviorPattern
  ): number {
    const peakTime = userPattern.sessionPatterns.peakProductivityTime
    
    if (peakTime === timeOfDay) return 0.9
    
    // Adjacent times get partial credit
    const timeOrder = ['morning', 'afternoon', 'evening', 'night']
    const peakIndex = timeOrder.indexOf(peakTime)
    const currentIndex = timeOrder.indexOf(timeOfDay)
    const distance = Math.abs(peakIndex - currentIndex)
    
    return Math.max(0.3, 0.9 - (distance * 0.2))
  }

  private calculateDurationOptimality(duration: number, userPattern: UserBehaviorPattern): number {
    const optimalDuration = userPattern.sessionPatterns.averageSessionLength
    const difference = Math.abs(duration - optimalDuration)
    
    // Penalty increases with distance from optimal
    const penalty = Math.min(difference / optimalDuration, 0.5)
    return Math.max(0.2, 1 - penalty)
  }

  private analyzeRecentPerformance(recentSessions: SmartSessionData[]): number {
    if (recentSessions.length === 0) return 0.5

    const recentSessionsLimited = recentSessions.slice(0, 10) // Last 10 sessions
    const avgProductivity = recentSessionsLimited.reduce((sum, session) => 
      sum + session.productivity.focusScore, 0) / recentSessionsLimited.length

    return avgProductivity / 100 // Convert to 0-1 scale
  }

  private calculateSessionTypeAlignment(
    sessionType: SmartSessionData['sessionType'],
    userPattern: UserBehaviorPattern,
    timeOfDay: SmartSessionData['environment']['timeOfDay']
  ): number {
    // Session type preferences by time of day
    const typeTimeAlignment = {
      'pomodoro': { morning: 0.8, afternoon: 0.9, evening: 0.7, night: 0.4 },
      'deep-focus': { morning: 0.9, afternoon: 0.8, evening: 0.6, night: 0.3 },
      'creative': { morning: 0.8, afternoon: 0.7, evening: 0.8, night: 0.6 },
      'mixing': { morning: 0.6, afternoon: 0.8, evening: 0.9, night: 0.7 },
      'learning': { morning: 0.9, afternoon: 0.7, evening: 0.5, night: 0.3 }
    }

    const baseAlignment = typeTimeAlignment[sessionType][timeOfDay]
    
    // Adjust based on user's conscientiousness (more structured types work better for conscientious users)
    if (sessionType === 'pomodoro' || sessionType === 'deep-focus') {
      return baseAlignment + (userPattern.personalityProfile.conscientiousness * 0.1)
    }

    return baseAlignment
  }

  private calculateDayOptimality(dayOfWeek: number, userPattern: UserBehaviorPattern): number {
    // Monday = 1, Sunday = 0
    const dayProductivity = {
      0: 0.4, // Sunday
      1: 0.8, // Monday  
      2: 0.9, // Tuesday
      3: 0.9, // Wednesday
      4: 0.8, // Thursday
      5: 0.6, // Friday
      6: 0.5  // Saturday
    }

    let baseProductivity = dayProductivity[dayOfWeek]
    
    // Adjust based on user's consistency score
    if (userPattern.productivityMetrics.consistencyScore > 0.8) {
      // Highly consistent users maintain productivity across all days
      baseProductivity = Math.max(baseProductivity, 0.7)
    }

    return baseProductivity
  }

  private calculateConfidenceLevel(recentSessions: SmartSessionData[], userPattern: UserBehaviorPattern): number {
    let confidence = 0.5
    
    // More recent sessions = higher confidence
    if (recentSessions.length >= 10) confidence += 0.3
    else if (recentSessions.length >= 5) confidence += 0.2
    else if (recentSessions.length >= 2) confidence += 0.1

    // Higher consistency = higher confidence
    confidence += userPattern.productivityMetrics.consistencyScore * 0.2

    return Math.min(0.95, confidence)
  }

  private generateRecommendations(
    factors: Array<{ factor: string; impact: number; reason: string }>,
    userPattern: UserBehaviorPattern,
    plannedSession: { startTime: Date; duration: number; sessionType: SmartSessionData['sessionType'] }
  ): string[] {
    const recommendations: string[] = []

    // Low impact factors need improvement
    const lowImpactFactors = factors.filter(f => f.impact < 0.5)
    
    for (const factor of lowImpactFactors) {
      switch (factor.factor) {
        case 'Time of Day':
          recommendations.push(`Consider scheduling sessions during your peak time: ${userPattern.sessionPatterns.peakProductivityTime}`)
          break
        case 'Session Duration':
          recommendations.push(`Try adjusting session length to ${userPattern.sessionPatterns.averageSessionLength} minutes for optimal productivity`)
          break
        case 'Recent Performance':
          recommendations.push(`Take a short break or reduce session intensity to recover from recent low productivity`)
          break
        case 'Session Type Fit':
          const timeOfDay = this.categorizeTimeOfDay(plannedSession.startTime.getHours())
          if (timeOfDay === 'morning') {
            recommendations.push(`Morning works better for deep-focus or learning sessions`)
          } else if (timeOfDay === 'evening') {
            recommendations.push(`Evening is ideal for creative work or mixing`)
          }
          break
      }
    }

    // General productivity recommendations
    if (userPattern.personalityProfile.conscientiousness < 0.5) {
      recommendations.push(`Use structured techniques like Pomodoro to maintain focus`)
    }

    if (userPattern.productivityMetrics.consistencyScore < 0.6) {
      recommendations.push(`Build consistency by scheduling regular sessions at the same time`)
    }

    return recommendations
  }

  private getTimeFromPeriod(period: string): number {
    switch (period) {
      case 'morning': return 9
      case 'afternoon': return 14
      case 'evening': return 19
      default: return 10
    }
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayOfWeek]
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

// Real-time productivity monitoring
export class ProductivityMonitor {
  private focusCheckInterval: NodeJS.Timeout | null = null
  private currentSession: SmartSessionData | null = null
  private focusEvents: Array<{ timestamp: number; focused: boolean }> = []

  startMonitoring(sessionData: Partial<SmartSessionData>): void {
    this.currentSession = {
      id: sessionData.id || `session_${Date.now()}`,
      userId: sessionData.userId!,
      projectId: sessionData.projectId,
      startTime: new Date(),
      duration: 0,
      sessionType: sessionData.sessionType || 'pomodoro',
      productivity: {
        focusScore: 100,
        outputQuality: 50,
        energyLevel: 80,
        distractionCount: 0,
        flowStateAchieved: false
      },
      environment: {
        timeOfDay: this.categorizeTimeOfDay(new Date().getHours()),
        dayOfWeek: new Date().getDay(),
        ambientNoise: 'quiet',
        mood: 'neutral'
      },
      outcomes: {
        beatsCreated: 0,
        projectProgress: 0,
        goalsAchieved: [],
        skillsImproved: []
      }
    }

    this.focusEvents = []
    this.startFocusTracking()
  }

  private startFocusTracking(): void {
    if (typeof window === 'undefined') return

    // Track window focus/blur events
    const handleFocus = () => this.recordFocusEvent(true)
    const handleBlur = () => this.recordFocusEvent(false)

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Periodic focus checks
    this.focusCheckInterval = setInterval(() => {
      this.updateProductivityMetrics()
    }, 60000) // Every minute

    // Clean up function
    const cleanup = () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      if (this.focusCheckInterval) {
        clearInterval(this.focusCheckInterval)
        this.focusCheckInterval = null
      }
    }

    // Store cleanup function for later use
    if (this.currentSession) {
      ;(this.currentSession as any).cleanup = cleanup
    }
  }

  private recordFocusEvent(focused: boolean): void {
    this.focusEvents.push({
      timestamp: Date.now(),
      focused
    })

    // Increment distraction count for focus loss
    if (!focused && this.currentSession) {
      this.currentSession.productivity.distractionCount++
    }
  }

  private updateProductivityMetrics(): void {
    if (!this.currentSession) return

    const now = Date.now()
    const sessionStart = this.currentSession.startTime.getTime()
    const sessionDuration = (now - sessionStart) / (1000 * 60) // minutes

    // Calculate focus score based on recent events
    const recentEvents = this.focusEvents.filter(
      event => now - event.timestamp < 10 * 60 * 1000 // Last 10 minutes
    )

    const focusedEvents = recentEvents.filter(event => event.focused)
    const focusScore = recentEvents.length > 0 
      ? (focusedEvents.length / recentEvents.length) * 100
      : this.currentSession.productivity.focusScore

    // Detect flow state (sustained focus with minimal distractions)
    const flowStateAchieved = sessionDuration > 25 && 
                              focusScore > 80 && 
                              this.currentSession.productivity.distractionCount < 3

    // Update energy level based on session duration and type
    let energyLevel = this.currentSession.productivity.energyLevel
    if (sessionDuration > 60) {
      energyLevel = Math.max(20, energyLevel - (sessionDuration - 60) * 0.5)
    }

    this.currentSession.productivity = {
      ...this.currentSession.productivity,
      focusScore: Math.round(focusScore),
      energyLevel: Math.round(energyLevel),
      flowStateAchieved
    }

    this.currentSession.duration = Math.round(sessionDuration)
  }

  updateProgress(progress: {
    beatsCreated?: number
    projectProgress?: number
    goalsAchieved?: string[]
  }): void {
    if (!this.currentSession) return

    if (progress.beatsCreated !== undefined) {
      this.currentSession.outcomes.beatsCreated = progress.beatsCreated
      
      // Increase output quality based on productivity
      const qualityBonus = this.currentSession.outcomes.beatsCreated * 10
      this.currentSession.productivity.outputQuality = Math.min(100, 50 + qualityBonus)
    }

    if (progress.projectProgress !== undefined) {
      this.currentSession.outcomes.projectProgress = progress.projectProgress
    }

    if (progress.goalsAchieved) {
      this.currentSession.outcomes.goalsAchieved.push(...progress.goalsAchieved)
    }
  }

  endSession(): SmartSessionData | null {
    if (!this.currentSession) return null

    this.currentSession.endTime = new Date()
    this.updateProductivityMetrics()

    // Generate AI insights
    this.currentSession.aiInsights = this.generateSessionInsights()

    // Cleanup
    const cleanup = (this.currentSession as any).cleanup
    if (cleanup) cleanup()

    const completedSession = this.currentSession
    this.currentSession = null
    this.focusEvents = []

    return completedSession
  }

  private generateSessionInsights(): SmartSessionData['aiInsights'] {
    if (!this.currentSession) return undefined

    const session = this.currentSession
    const successFactors: string[] = []
    const improvementSuggestions: string[] = []

    // Analyze success factors
    if (session.productivity.focusScore > 80) {
      successFactors.push('Excellent focus maintained throughout session')
    }

    if (session.productivity.flowStateAchieved) {
      successFactors.push('Achieved flow state for optimal productivity')
    }

    if (session.outcomes.beatsCreated > 0) {
      successFactors.push(`Successfully created ${session.outcomes.beatsCreated} beats`)
    }

    if (session.productivity.distractionCount < 2) {
      successFactors.push('Minimal distractions during work time')
    }

    // Generate improvement suggestions
    if (session.productivity.focusScore < 60) {
      improvementSuggestions.push('Consider using focus techniques or eliminating distractions')
    }

    if (session.productivity.distractionCount > 5) {
      improvementSuggestions.push('Try putting devices in airplane mode or using website blockers')
    }

    if (session.duration > 90 && session.productivity.energyLevel < 40) {
      improvementSuggestions.push('Consider shorter sessions or regular breaks to maintain energy')
    }

    if (session.outcomes.beatsCreated === 0 && session.duration > 45) {
      improvementSuggestions.push('Set smaller, achievable goals to build momentum')
    }

    // Recommend next session time (2-24 hours from now based on performance)
    const nextSessionDelay = session.productivity.focusScore > 70 ? 4 : 8 // hours
    const optimalNextSessionTime = new Date()
    optimalNextSessionTime.setHours(optimalNextSessionTime.getHours() + nextSessionDelay)

    // Recommend session type based on performance and time
    let recommendedSessionType: SmartSessionData['sessionType'] = 'pomodoro'
    if (session.productivity.flowStateAchieved) {
      recommendedSessionType = 'deep-focus'
    } else if (session.productivity.focusScore < 50) {
      recommendedSessionType = 'pomodoro' // More structure needed
    }

    return {
      successFactors,
      improvementSuggestions,
      optimalNextSessionTime,
      recommendedSessionType
    }
  }

  private categorizeTimeOfDay(hour: number): SmartSessionData['environment']['timeOfDay'] {
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  getCurrentSessionData(): SmartSessionData | null {
    if (this.currentSession) {
      this.updateProductivityMetrics()
    }
    return this.currentSession
  }
}

// Session analytics and insights
export class SessionAnalytics {
  // Analyze session patterns and trends
  analyzeSessionTrends(sessions: SmartSessionData[]): {
    productivity: {
      trend: 'improving' | 'stable' | 'declining'
      averageScore: number
      bestPerformanceFactors: string[]
    }
    timing: {
      optimalTimes: string[]
      worstTimes: string[]
      consistencyScore: number
    }
    sessionTypes: {
      mostEffective: SmartSessionData['sessionType']
      recommendations: string[]
    }
    predictions: {
      nextWeekProductivity: number
      burnoutRisk: number
      recommendations: string[]
    }
  } {
    if (sessions.length === 0) {
      return this.getDefaultAnalysis()
    }

    // Analyze productivity trend
    const recentSessions = sessions.slice(0, 20) // Last 20 sessions
    const olderSessions = sessions.slice(20, 40) // Previous 20 sessions

    const recentAvg = this.calculateAverageProductivity(recentSessions)
    const olderAvg = this.calculateAverageProductivity(olderSessions)

    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentAvg > olderAvg * 1.1) trend = 'improving'
    else if (recentAvg < olderAvg * 0.9) trend = 'declining'

    // Find best performance factors
    const highPerformanceSessions = sessions.filter(s => s.productivity.focusScore > 80)
    const bestPerformanceFactors = this.identifySuccessFactors(highPerformanceSessions)

    // Analyze timing patterns
    const timingAnalysis = this.analyzeTimingPatterns(sessions)

    // Analyze session type effectiveness
    const sessionTypeAnalysis = this.analyzeSessionTypes(sessions)

    // Generate predictions
    const predictions = this.generatePredictions(sessions, trend)

    return {
      productivity: {
        trend,
        averageScore: recentAvg,
        bestPerformanceFactors
      },
      timing: timingAnalysis,
      sessionTypes: sessionTypeAnalysis,
      predictions
    }
  }

  private calculateAverageProductivity(sessions: SmartSessionData[]): number {
    if (sessions.length === 0) return 0
    return sessions.reduce((sum, s) => sum + s.productivity.focusScore, 0) / sessions.length
  }

  private identifySuccessFactors(sessions: SmartSessionData[]): string[] {
    const factors: { [key: string]: number } = {}

    sessions.forEach(session => {
      if (session.productivity.flowStateAchieved) {
        factors['Flow state achievement'] = (factors['Flow state achievement'] || 0) + 1
      }
      if (session.productivity.distractionCount < 2) {
        factors['Minimal distractions'] = (factors['Minimal distractions'] || 0) + 1
      }
      if (session.duration >= 45 && session.duration <= 90) {
        factors['Optimal session length'] = (factors['Optimal session length'] || 0) + 1
      }
      if (session.environment.timeOfDay === 'morning' || session.environment.timeOfDay === 'afternoon') {
        factors['Daytime sessions'] = (factors['Daytime sessions'] || 0) + 1
      }
    })

    return Object.entries(factors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([factor]) => factor)
  }

  private analyzeTimingPatterns(sessions: SmartSessionData[]): {
    optimalTimes: string[]
    worstTimes: string[]
    consistencyScore: number
  } {
    const timePerformance: { [time: string]: number[] } = {}

    sessions.forEach(session => {
      const time = session.environment.timeOfDay
      if (!timePerformance[time]) timePerformance[time] = []
      timePerformance[time].push(session.productivity.focusScore)
    })

    const timeAverages = Object.entries(timePerformance).map(([time, scores]) => ({
      time,
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length
    }))

    const sortedTimes = timeAverages.sort((a, b) => b.average - a.average)
    const optimalTimes = sortedTimes.slice(0, 2).map(t => t.time)
    const worstTimes = sortedTimes.slice(-2).map(t => t.time)

    // Calculate consistency (how regular session timing is)
    const sessionTimes = sessions.map(s => s.startTime.getHours())
    const timeVariance = this.calculateVariance(sessionTimes)
    const consistencyScore = Math.max(0, Math.min(1, 1 - (timeVariance / 100)))

    return { optimalTimes, worstTimes, consistencyScore }
  }

  private analyzeSessionTypes(sessions: SmartSessionData[]): {
    mostEffective: SmartSessionData['sessionType']
    recommendations: string[]
  } {
    const typePerformance: { [type: string]: number[] } = {}

    sessions.forEach(session => {
      const type = session.sessionType
      if (!typePerformance[type]) typePerformance[type] = []
      typePerformance[type].push(session.productivity.focusScore)
    })

    const typeAverages = Object.entries(typePerformance).map(([type, scores]) => ({
      type: type as SmartSessionData['sessionType'],
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      count: scores.length
    }))

    const mostEffective = typeAverages
      .filter(t => t.count >= 3) // Need at least 3 sessions for reliability
      .sort((a, b) => b.average - a.average)[0]?.type || 'pomodoro'

    const recommendations: string[] = []
    
    if (typeAverages.find(t => t.type === 'deep-focus')?.average > 80) {
      recommendations.push('Deep focus sessions work well for you')
    }
    
    if (typeAverages.find(t => t.type === 'pomodoro')?.average > 75) {
      recommendations.push('Structured Pomodoro technique maintains your productivity')
    }

    return { mostEffective, recommendations }
  }

  private generatePredictions(
    sessions: SmartSessionData[], 
    trend: 'improving' | 'stable' | 'declining'
  ): {
    nextWeekProductivity: number
    burnoutRisk: number
    recommendations: string[]
  } {
    const currentAvg = this.calculateAverageProductivity(sessions.slice(0, 10))
    
    let nextWeekProductivity = currentAvg
    if (trend === 'improving') nextWeekProductivity *= 1.05
    else if (trend === 'declining') nextWeekProductivity *= 0.95

    // Calculate burnout risk
    const recentIntensity = sessions.slice(0, 7) // Last 7 sessions
    const avgDuration = recentIntensity.reduce((sum, s) => sum + s.duration, 0) / recentIntensity.length
    const avgDistractions = recentIntensity.reduce((sum, s) => sum + s.productivity.distractionCount, 0) / recentIntensity.length
    
    let burnoutRisk = 0
    if (avgDuration > 90) burnoutRisk += 0.3
    if (avgDistractions > 5) burnoutRisk += 0.2
    if (trend === 'declining') burnoutRisk += 0.3
    
    burnoutRisk = Math.min(1, burnoutRisk)

    const recommendations: string[] = []
    
    if (burnoutRisk > 0.6) {
      recommendations.push('Consider taking a break or reducing session intensity')
      recommendations.push('Focus on shorter, high-quality sessions')
    } else if (trend === 'improving') {
      recommendations.push('Great momentum! Consider gradually increasing session complexity')
    }

    return {
      nextWeekProductivity,
      burnoutRisk,
      recommendations
    }
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2))
    return squareDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
  }

  private getDefaultAnalysis() {
    return {
      productivity: {
        trend: 'stable' as const,
        averageScore: 50,
        bestPerformanceFactors: []
      },
      timing: {
        optimalTimes: ['morning'],
        worstTimes: ['night'],
        consistencyScore: 0.5
      },
      sessionTypes: {
        mostEffective: 'pomodoro' as const,
        recommendations: ['Start with structured Pomodoro sessions to build habits']
      },
      predictions: {
        nextWeekProductivity: 50,
        burnoutRisk: 0.2,
        recommendations: ['Build consistency with regular session timing']
      }
    }
  }
}
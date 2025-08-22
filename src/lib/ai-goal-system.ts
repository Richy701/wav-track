// AI-Powered Goal Setting and Tracking System
// Enhances existing WeeklyGoal system with intelligent recommendations and adaptive tracking

import { WeeklyGoal } from '@/lib/types'
import { UserBehaviorPattern } from './adaptive-gamification'

// Enhanced goal interface (extends existing WeeklyGoal)
export interface SmartGoal extends Omit<WeeklyGoal, 'id' | 'userId'> {
  id: string
  userId: string
  type: 'weekly' | 'monthly' | 'project' | 'skill' | 'habit'
  category: 'production' | 'learning' | 'consistency' | 'quality' | 'exploration'
  priority: 'low' | 'medium' | 'high' | 'critical'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  
  // AI-enhanced properties
  aiGenerated: boolean
  personalityMatch: number // 0-1 score for user fit
  successProbability: number // 0-1 predicted success chance
  adaptiveTargets: {
    minimum: number // Lowest acceptable target
    stretch: number // Aspirational target
    optimal: number // AI-recommended target
  }
  
  // Smart tracking
  milestones: Array<{
    id: string
    description: string
    target: number
    completed: boolean
    completedAt?: string
    aiGenerated: boolean
  }>
  
  // Progress insights
  progressInsights: {
    velocity: number // Current progress rate
    projectedCompletion: string // Estimated completion date
    riskFactors: string[] // Potential blockers
    successFactors: string[] // What's working well
    recommendations: string[] // AI suggestions for improvement
  }
  
  // Contextual data
  contextualFactors: {
    seasonality: 'none' | 'seasonal' | 'holiday_affected'
    workload: 'light' | 'normal' | 'heavy'
    energyLevel: number // 0-100
    motivation: number // 0-100
    externalPressure: number // 0-100
  }
}

// Goal recommendation engine
export class AIGoalRecommendationEngine {
  private readonly GOAL_TEMPLATES = {
    production: [
      {
        name: 'Beat Creation Challenge',
        description: 'Create {target} high-quality beats',
        baseTarget: 5,
        duration: 'weekly',
        difficulty: 'medium',
        category: 'production' as const
      },
      {
        name: 'Genre Explorer',
        description: 'Produce beats in {target} different genres',
        baseTarget: 3,
        duration: 'weekly',
        difficulty: 'hard',
        category: 'exploration' as const
      },
      {
        name: 'Daily Producer',
        description: 'Create at least one beat every day for {target} days',
        baseTarget: 7,
        duration: 'weekly',
        difficulty: 'hard',
        category: 'consistency' as const
      }
    ],
    learning: [
      {
        name: 'Skill Builder',
        description: 'Practice {skill} for {target} hours',
        baseTarget: 3,
        duration: 'weekly',
        difficulty: 'medium',
        category: 'learning' as const
      },
      {
        name: 'Theory Master',
        description: 'Learn {target} new music theory concepts',
        baseTarget: 2,
        duration: 'weekly',
        difficulty: 'medium',
        category: 'learning' as const
      }
    ],
    quality: [
      {
        name: 'Quality Focus',
        description: 'Spend {target} hours perfecting existing projects',
        baseTarget: 4,
        duration: 'weekly',
        difficulty: 'medium',
        category: 'quality' as const
      },
      {
        name: 'Mix Master',
        description: 'Complete mixing for {target} tracks',
        baseTarget: 2,
        duration: 'weekly',
        difficulty: 'hard',
        category: 'quality' as const
      }
    ]
  }

  // Generate personalized goals based on user pattern
  async generatePersonalizedGoals(
    userPattern: UserBehaviorPattern,
    currentGoals: SmartGoal[],
    preferences: {
      focusAreas?: ('production' | 'learning' | 'quality')[]
      timeCommitment?: 'low' | 'medium' | 'high'
      challengeLevel?: 'maintain' | 'increase' | 'decrease'
    } = {}
  ): Promise<SmartGoal[]> {
    const { focusAreas = ['production'], timeCommitment = 'medium', challengeLevel = 'maintain' } = preferences
    const recommendedGoals: SmartGoal[] = []

    for (const area of focusAreas) {
      const templates = this.GOAL_TEMPLATES[area] || []
      
      for (const template of templates) {
        // Calculate adaptive targets based on user pattern
        const adaptiveTargets = this.calculateAdaptiveTargets(template, userPattern, challengeLevel)
        
        // Calculate success probability
        const successProbability = this.predictGoalSuccess(template, userPattern, currentGoals, adaptiveTargets.optimal)
        
        // Only recommend goals with reasonable success chance
        if (successProbability < 0.3) continue
        
        // Calculate personality match
        const personalityMatch = this.calculatePersonalityMatch(template, userPattern)
        
        const goal: SmartGoal = {
          id: `ai_goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: userPattern.userId,
          targetBeats: template.category === 'production' ? adaptiveTargets.optimal : 0,
          completedBeats: 0,
          startDate: new Date().toISOString(),
          endDate: this.calculateEndDate(template.duration).toISOString(),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          
          // Enhanced properties
          type: template.duration === 'weekly' ? 'weekly' : 'monthly',
          category: template.category,
          priority: this.calculatePriority(personalityMatch, successProbability),
          difficulty: this.adjustDifficulty(template.difficulty, userPattern, challengeLevel),
          
          aiGenerated: true,
          personalityMatch,
          successProbability,
          adaptiveTargets,
          
          milestones: this.generateMilestones(template, adaptiveTargets.optimal),
          progressInsights: {
            velocity: 0,
            projectedCompletion: this.calculateEndDate(template.duration).toISOString(),
            riskFactors: this.identifyRiskFactors(userPattern, template),
            successFactors: this.identifySuccessFactors(userPattern, template),
            recommendations: this.generateInitialRecommendations(userPattern, template)
          },
          
          contextualFactors: this.assessContextualFactors(userPattern)
        }
        
        recommendedGoals.push(goal)
      }
    }

    // Sort by combination of personality match and success probability
    return recommendedGoals
      .sort((a, b) => (b.personalityMatch * b.successProbability) - (a.personalityMatch * a.successProbability))
      .slice(0, 5) // Top 5 recommendations
  }

  // Calculate adaptive targets based on user capability and preferences
  private calculateAdaptiveTargets(
    template: any,
    userPattern: UserBehaviorPattern,
    challengeLevel: 'maintain' | 'increase' | 'decrease'
  ): SmartGoal['adaptiveTargets'] {
    const { productivityMetrics, achievementPatterns } = userPattern
    
    // Base target from template
    let baseTarget = template.baseTarget
    
    // Adjust based on user's productivity metrics
    const productivityMultiplier = productivityMetrics.beatsPerSession * productivityMetrics.consistencyScore
    baseTarget = Math.round(baseTarget * (0.5 + productivityMultiplier))
    
    // Adjust based on challenge level preference
    const challengeMultipliers = {
      decrease: 0.7,
      maintain: 1.0,
      increase: 1.3
    }
    baseTarget = Math.round(baseTarget * challengeMultipliers[challengeLevel])
    
    // Adjust based on completion rate (if they're failing goals, make them easier)
    if (achievementPatterns.completionRate < 0.4) {
      baseTarget = Math.round(baseTarget * 0.8)
    } else if (achievementPatterns.completionRate > 0.8) {
      baseTarget = Math.round(baseTarget * 1.2)
    }
    
    const minimum = Math.max(1, Math.round(baseTarget * 0.6))
    const optimal = Math.max(minimum + 1, baseTarget)
    const stretch = Math.round(optimal * 1.5)
    
    return { minimum, optimal, stretch }
  }

  // Predict likelihood of goal success
  private predictGoalSuccess(
    template: any,
    userPattern: UserBehaviorPattern,
    currentGoals: SmartGoal[],
    targetValue: number
  ): number {
    let probability = 0.5 // Base probability
    
    const { achievementPatterns, productivityMetrics, personalityProfile } = userPattern
    
    // Factor in past completion rate
    probability += (achievementPatterns.completionRate - 0.5) * 0.4
    
    // Factor in consistency
    probability += (productivityMetrics.consistencyScore - 0.5) * 0.3
    
    // Factor in current goal load
    const activeGoals = currentGoals.filter(g => g.status === 'active').length
    if (activeGoals > 3) probability -= 0.2
    else if (activeGoals === 0) probability += 0.1
    
    // Factor in conscientiousness for structured goals
    if (template.category === 'consistency' || template.difficulty === 'hard') {
      probability += personalityProfile.conscientiousness * 0.2
    }
    
    // Factor in openness for exploration goals
    if (template.category === 'exploration') {
      probability += personalityProfile.openness * 0.2
    }
    
    // Factor in target difficulty vs. user capability
    const capabilityRatio = productivityMetrics.beatsPerSession / (targetValue / 7) // Weekly target
    if (capabilityRatio > 1) {
      probability += 0.1
    } else if (capabilityRatio < 0.5) {
      probability -= 0.2
    }
    
    return Math.max(0.1, Math.min(0.9, probability))
  }

  private calculatePersonalityMatch(template: any, userPattern: UserBehaviorPattern): number {
    const { personalityProfile } = userPattern
    let match = 0.5
    
    switch (template.category) {
      case 'production':
        match += personalityProfile.conscientiousness * 0.3
        break
      case 'exploration':
        match += personalityProfile.openness * 0.4
        break
      case 'learning':
        match += personalityProfile.openness * 0.2 + personalityProfile.conscientiousness * 0.2
        break
      case 'consistency':
        match += personalityProfile.conscientiousness * 0.5
        break
      case 'quality':
        match += personalityProfile.conscientiousness * 0.3 + (1 - personalityProfile.neuroticism) * 0.2
        break
    }
    
    // Factor in difficulty preference
    const difficultyMap = { easy: 0.3, medium: 0.6, hard: 0.9, expert: 1.0 }
    const templateDifficulty = difficultyMap[template.difficulty]
    const userPreference = difficultyMap[userPattern.achievementPatterns.preferredDifficulty]
    
    const difficultyMatch = 1 - Math.abs(templateDifficulty - userPreference)
    match += difficultyMatch * 0.2
    
    return Math.max(0.1, Math.min(1.0, match))
  }

  private calculatePriority(personalityMatch: number, successProbability: number): SmartGoal['priority'] {
    const score = personalityMatch * successProbability
    
    if (score > 0.8) return 'high'
    if (score > 0.6) return 'medium'
    return 'low'
  }

  private adjustDifficulty(
    baseDifficulty: string,
    userPattern: UserBehaviorPattern,
    challengeLevel: 'maintain' | 'increase' | 'decrease'
  ): SmartGoal['difficulty'] {
    const difficulties = ['easy', 'medium', 'hard', 'expert']
    let index = difficulties.indexOf(baseDifficulty)
    
    // Adjust based on challenge level
    if (challengeLevel === 'increase') index = Math.min(index + 1, difficulties.length - 1)
    else if (challengeLevel === 'decrease') index = Math.max(index - 1, 0)
    
    // Adjust based on user's completion rate
    if (userPattern.achievementPatterns.completionRate < 0.4 && index > 0) {
      index = Math.max(0, index - 1)
    }
    
    return difficulties[index] as SmartGoal['difficulty']
  }

  private generateMilestones(template: any, targetValue: number): SmartGoal['milestones'] {
    const milestones: SmartGoal['milestones'] = []
    const milestoneCount = Math.min(5, Math.max(2, Math.floor(targetValue / 2)))
    
    for (let i = 1; i <= milestoneCount; i++) {
      const target = Math.round((targetValue * i) / milestoneCount)
      milestones.push({
        id: `milestone_${i}`,
        description: `Reach ${target} ${template.category === 'production' ? 'beats' : 'progress points'}`,
        target,
        completed: false,
        aiGenerated: true
      })
    }
    
    return milestones
  }

  private identifyRiskFactors(userPattern: UserBehaviorPattern, template: any): string[] {
    const risks: string[] = []
    
    if (userPattern.achievementPatterns.completionRate < 0.5) {
      risks.push('History of incomplete goals')
    }
    
    if (userPattern.productivityMetrics.consistencyScore < 0.4) {
      risks.push('Inconsistent work patterns')
    }
    
    if (template.difficulty === 'hard' && userPattern.personalityProfile.neuroticism > 0.7) {
      risks.push('High difficulty may cause stress')
    }
    
    if (template.category === 'consistency' && userPattern.sessionPatterns.sessionsPerWeek < 3) {
      risks.push('Low current session frequency')
    }
    
    return risks
  }

  private identifySuccessFactors(userPattern: UserBehaviorPattern, template: any): string[] {
    const factors: string[] = []
    
    if (userPattern.achievementPatterns.completionRate > 0.7) {
      factors.push('Strong track record of goal completion')
    }
    
    if (userPattern.productivityMetrics.consistencyScore > 0.7) {
      factors.push('Consistent work habits')
    }
    
    if (template.category === 'production' && userPattern.productivityMetrics.beatsPerSession > 1) {
      factors.push('Good production efficiency')
    }
    
    return factors
  }

  private generateInitialRecommendations(userPattern: UserBehaviorPattern, template: any): string[] {
    const recommendations: string[] = []
    
    if (userPattern.sessionPatterns.averageSessionLength < 45) {
      recommendations.push('Consider longer focused sessions to increase productivity')
    }
    
    if (template.category === 'consistency') {
      recommendations.push(`Schedule sessions during your peak time: ${userPattern.sessionPatterns.peakProductivityTime}`)
    }
    
    if (userPattern.personalityProfile.conscientiousness < 0.5) {
      recommendations.push('Use structured techniques like Pomodoro to maintain focus')
    }
    
    return recommendations
  }

  private assessContextualFactors(userPattern: UserBehaviorPattern): SmartGoal['contextualFactors'] {
    return {
      seasonality: 'none', // Would be determined by time of year and user patterns
      workload: userPattern.sessionPatterns.sessionsPerWeek > 4 ? 'heavy' : 'normal',
      energyLevel: Math.round(userPattern.productivityMetrics.consistencyScore * 100),
      motivation: Math.round(userPattern.achievementPatterns.completionRate * 100),
      externalPressure: 30 // Default moderate pressure
    }
  }

  private calculateEndDate(duration: string): Date {
    const now = new Date()
    switch (duration) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
  }
}

// Intelligent progress tracking and adaptation
export class SmartProgressTracker {
  // Update goal progress and provide insights
  updateGoalProgress(
    goal: SmartGoal,
    newProgress: number,
    sessionData?: {
      duration: number
      productivity: number
      beatsCreated: number
    }
  ): SmartGoal {
    const updatedGoal = { ...goal }
    updatedGoal.completedBeats = newProgress
    updatedGoal.updatedAt = new Date().toISOString()

    // Update milestone completion
    updatedGoal.milestones = goal.milestones.map(milestone => {
      if (!milestone.completed && newProgress >= milestone.target) {
        return {
          ...milestone,
          completed: true,
          completedAt: new Date().toISOString()
        }
      }
      return milestone
    })

    // Calculate velocity
    const daysSinceStart = (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24)
    const velocity = daysSinceStart > 0 ? newProgress / daysSinceStart : 0

    // Project completion date
    const remainingProgress = goal.adaptiveTargets.optimal - newProgress
    const daysToCompletion = velocity > 0 ? Math.ceil(remainingProgress / velocity) : Infinity
    const projectedCompletion = new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000).toISOString()

    // Update progress insights
    updatedGoal.progressInsights = {
      ...goal.progressInsights,
      velocity,
      projectedCompletion: daysToCompletion < 365 ? projectedCompletion : 'Unknown',
      riskFactors: this.updateRiskFactors(goal, velocity, daysSinceStart),
      successFactors: this.updateSuccessFactors(goal, velocity, sessionData),
      recommendations: this.generateProgressRecommendations(goal, velocity, newProgress)
    }

    return updatedGoal
  }

  // Adapt goal targets based on performance
  adaptGoalTargets(goal: SmartGoal, performanceHistory: number[]): SmartGoal {
    if (performanceHistory.length < 3) return goal // Need enough data

    const updatedGoal = { ...goal }
    const averagePerformance = performanceHistory.reduce((sum, p) => sum + p, 0) / performanceHistory.length
    
    // Calculate performance ratio vs expected
    const expectedProgress = goal.adaptiveTargets.optimal * (performanceHistory.length / 7) // Assuming weekly goal
    const performanceRatio = expectedProgress > 0 ? averagePerformance / expectedProgress : 1

    // Adapt targets based on performance
    if (performanceRatio > 1.5) {
      // Performing much better than expected, increase targets
      updatedGoal.adaptiveTargets = {
        minimum: goal.adaptiveTargets.minimum,
        optimal: Math.round(goal.adaptiveTargets.optimal * 1.2),
        stretch: Math.round(goal.adaptiveTargets.stretch * 1.1)
      }
    } else if (performanceRatio < 0.6) {
      // Performing worse than expected, decrease targets
      updatedGoal.adaptiveTargets = {
        minimum: Math.round(goal.adaptiveTargets.minimum * 0.8),
        optimal: Math.round(goal.adaptiveTargets.optimal * 0.9),
        stretch: goal.adaptiveTargets.stretch
      }
    }

    return updatedGoal
  }

  private updateRiskFactors(goal: SmartGoal, velocity: number, daysSinceStart: number): string[] {
    const risks: string[] = [...goal.progressInsights.riskFactors]
    
    // Check for velocity issues
    const expectedVelocity = goal.adaptiveTargets.optimal / 7 // Assuming weekly goal
    if (velocity < expectedVelocity * 0.5 && daysSinceStart > 2) {
      risks.push('Progress is significantly behind schedule')
    }
    
    // Check for stagnation
    if (velocity === 0 && daysSinceStart > 3) {
      risks.push('No progress made in several days')
    }
    
    // Remove resolved risks
    return risks.filter(risk => {
      if (risk.includes('behind schedule') && velocity >= expectedVelocity * 0.8) return false
      if (risk.includes('No progress') && velocity > 0) return false
      return true
    })
  }

  private updateSuccessFactors(
    goal: SmartGoal, 
    velocity: number, 
    sessionData?: { duration: number; productivity: number; beatsCreated: number }
  ): string[] {
    const factors: string[] = [...goal.progressInsights.successFactors]
    
    const expectedVelocity = goal.adaptiveTargets.optimal / 7
    if (velocity > expectedVelocity * 1.2) {
      factors.push('Exceeding expected progress rate')
    }
    
    if (sessionData && sessionData.productivity > 80) {
      factors.push('High productivity in recent sessions')
    }
    
    // Count milestone completions
    const completedMilestones = goal.milestones.filter(m => m.completed).length
    if (completedMilestones > goal.milestones.length / 2) {
      factors.push('Good milestone achievement rate')
    }
    
    return [...new Set(factors)] // Remove duplicates
  }

  private generateProgressRecommendations(goal: SmartGoal, velocity: number, currentProgress: number): string[] {
    const recommendations: string[] = []
    
    const progressRatio = currentProgress / goal.adaptiveTargets.optimal
    const expectedVelocity = goal.adaptiveTargets.optimal / 7
    
    if (velocity < expectedVelocity * 0.7) {
      recommendations.push('Consider adjusting your schedule to allocate more time for this goal')
      recommendations.push('Break down remaining work into smaller, manageable tasks')
    }
    
    if (progressRatio > 0.8) {
      recommendations.push('Excellent progress! Consider aiming for the stretch target')
    } else if (progressRatio < 0.3 && velocity > 0) {
      recommendations.push('Focus on consistency rather than intensity to build momentum')
    }
    
    // Specific recommendations based on goal type
    switch (goal.category) {
      case 'production':
        if (velocity < expectedVelocity) {
          recommendations.push('Try shorter, more frequent production sessions')
        }
        break
      case 'consistency':
        recommendations.push('Set up daily reminders to maintain your streak')
        break
      case 'learning':
        recommendations.push('Combine learning with practice for better retention')
        break
    }
    
    return recommendations
  }
}

// Goal completion prediction and risk assessment
export class GoalRiskAssessment {
  // Assess risk of goal failure and provide mitigation strategies
  assessGoalRisk(
    goal: SmartGoal,
    userPattern: UserBehaviorPattern,
    recentSessions: any[] = []
  ): {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    riskScore: number // 0-1
    primaryRiskFactors: Array<{ factor: string; severity: number; mitigation: string }>
    recommendations: string[]
    interventionSuggestions?: string[]
  } {
    let riskScore = 0
    const riskFactors: Array<{ factor: string; severity: number; mitigation: string }> = []
    
    const daysSinceStart = (Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24)
    const daysRemaining = (new Date(goal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    const totalDays = daysSinceStart + daysRemaining
    
    // Progress vs time risk
    const expectedProgress = (daysSinceStart / totalDays) * goal.adaptiveTargets.optimal
    const actualProgress = goal.completedBeats
    const progressGap = expectedProgress - actualProgress
    
    if (progressGap > goal.adaptiveTargets.optimal * 0.2) {
      const severity = Math.min(1, progressGap / goal.adaptiveTargets.optimal)
      riskScore += severity * 0.4
      riskFactors.push({
        factor: 'Behind Schedule',
        severity,
        mitigation: 'Increase daily effort or extend timeline'
      })
    }
    
    // Velocity trend risk
    const velocity = goal.progressInsights.velocity
    const requiredVelocity = (goal.adaptiveTargets.optimal - actualProgress) / Math.max(1, daysRemaining)
    
    if (velocity < requiredVelocity * 0.8) {
      const severity = Math.min(1, (requiredVelocity - velocity) / requiredVelocity)
      riskScore += severity * 0.3
      riskFactors.push({
        factor: 'Insufficient Velocity',
        severity,
        mitigation: 'Increase session frequency or efficiency'
      })
    }
    
    // Consistency risk based on user pattern
    if (userPattern.productivityMetrics.consistencyScore < 0.6) {
      riskScore += 0.2
      riskFactors.push({
        factor: 'Inconsistent Work Pattern',
        severity: 1 - userPattern.productivityMetrics.consistencyScore,
        mitigation: 'Establish regular work schedule'
      })
    }
    
    // Recent activity risk
    const recentSessionCount = recentSessions.filter(s => 
      new Date(s.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length
    
    if (recentSessionCount < 3 && goal.category === 'consistency') {
      riskScore += 0.2
      riskFactors.push({
        factor: 'Low Recent Activity',
        severity: (3 - recentSessionCount) / 3,
        mitigation: 'Resume regular sessions immediately'
      })
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (riskScore < 0.25) riskLevel = 'low'
    else if (riskScore < 0.5) riskLevel = 'medium'
    else if (riskScore < 0.75) riskLevel = 'high'
    else riskLevel = 'critical'
    
    // Generate recommendations
    const recommendations = this.generateRiskMitigationRecommendations(goal, riskFactors, riskLevel)
    
    // Generate intervention suggestions for high-risk goals
    const interventionSuggestions = riskLevel === 'high' || riskLevel === 'critical' 
      ? this.generateInterventionSuggestions(goal, riskFactors)
      : undefined
    
    return {
      riskLevel,
      riskScore: Math.min(1, riskScore),
      primaryRiskFactors: riskFactors.sort((a, b) => b.severity - a.severity),
      recommendations,
      interventionSuggestions
    }
  }

  private generateRiskMitigationRecommendations(
    goal: SmartGoal,
    riskFactors: Array<{ factor: string; severity: number; mitigation: string }>,
    riskLevel: string
  ): string[] {
    const recommendations: string[] = []
    
    // Add specific mitigations for each risk factor
    riskFactors.forEach(risk => {
      if (risk.severity > 0.5) {
        recommendations.push(risk.mitigation)
      }
    })
    
    // Add general recommendations based on risk level
    if (riskLevel === 'medium' || riskLevel === 'high') {
      recommendations.push('Consider adjusting the goal target to a more achievable level')
      recommendations.push('Schedule specific time blocks dedicated to this goal')
    }
    
    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push('Focus on this goal as your top priority')
      recommendations.push('Consider breaking the goal into smaller, immediate actions')
    }
    
    return recommendations
  }

  private generateInterventionSuggestions(
    goal: SmartGoal,
    riskFactors: Array<{ factor: string; severity: number; mitigation: string }>
  ): string[] {
    const interventions: string[] = []
    
    interventions.push('Send daily progress reminders')
    interventions.push('Reduce goal target to minimum acceptable level')
    interventions.push('Schedule one-on-one coaching session')
    
    if (riskFactors.some(r => r.factor.includes('Velocity'))) {
      interventions.push('Suggest shorter, more frequent work sessions')
    }
    
    if (riskFactors.some(r => r.factor.includes('Schedule'))) {
      interventions.push('Extend goal deadline with revised milestones')
    }
    
    return interventions
  }
}
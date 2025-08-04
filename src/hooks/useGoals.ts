import { useState, useEffect, useCallback } from 'react'
import {
  Goal,
  loadGoals,
  saveGoals,
  validateGoal,
  sortGoalsByPriority,
  getTodayDateString
} from '@/utils/sessionUtils'

export interface UseGoalsReturn {
  // State
  goals: Goal[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addGoal: (text: string, priority?: Goal['priority'], estimatedMinutes?: number) => Promise<{ success: boolean; error?: string }>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<{ success: boolean; error?: string }>
  toggleGoal: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteGoal: (id: string) => Promise<{ success: boolean; error?: string }>
  reorderGoals: (startIndex: number, endIndex: number) => void
  clearCompleted: () => void
  
  // Computed values
  completedGoals: Goal[]
  pendingGoals: Goal[]
  completionRate: number
  totalEstimatedTime: number
  completedEstimatedTime: number
}

export const useGoals = (): UseGoalsReturn => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load goals on mount
  useEffect(() => {
    try {
      const loadedGoals = loadGoals()
      setGoals(sortGoalsByPriority(loadedGoals))
      setError(null)
    } catch (err) {
      console.error('Failed to load goals:', err)
      setError('Failed to load goals')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Save goals whenever they change
  const persistGoals = useCallback((newGoals: Goal[]) => {
    try {
      saveGoals(newGoals)
      setError(null)
    } catch (err) {
      console.error('Failed to save goals:', err)
      setError('Failed to save goals')
    }
  }, [])
  
  const addGoal = useCallback(async (
    text: string, 
    priority: Goal['priority'] = 'medium', 
    estimatedMinutes: number = 25
  ): Promise<{ success: boolean; error?: string }> => {
    const validation = validateGoal(text)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    
    try {
      const newGoal: Goal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: text.trim(),
        completed: false,
        priority,
        estimatedMinutes,
        createdAt: new Date()
      }
      
      const updatedGoals = [...goals, newGoal]
      const sortedGoals = sortGoalsByPriority(updatedGoals)
      
      setGoals(sortedGoals)
      persistGoals(sortedGoals)
      
      return { success: true }
    } catch (err) {
      console.error('Failed to add goal:', err)
      return { success: false, error: 'Failed to add goal' }
    }
  }, [goals, persistGoals])
  
  const updateGoal = useCallback(async (
    id: string, 
    updates: Partial<Goal>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate text if it's being updated
      if (updates.text !== undefined) {
        const validation = validateGoal(updates.text)
        if (!validation.valid) {
          return { success: false, error: validation.error }
        }
        updates.text = updates.text.trim()
      }
      
      const updatedGoals = goals.map(goal => {
        if (goal.id === id) {
          const updatedGoal = { ...goal, ...updates }
          
          // Set completion timestamp if completing
          if (updates.completed === true && !goal.completed) {
            updatedGoal.completedAt = new Date()
          } else if (updates.completed === false && goal.completed) {
            updatedGoal.completedAt = undefined
          }
          
          return updatedGoal
        }
        return goal
      })
      
      const sortedGoals = sortGoalsByPriority(updatedGoals)
      
      setGoals(sortedGoals)
      persistGoals(sortedGoals)
      
      return { success: true }
    } catch (err) {
      console.error('Failed to update goal:', err)
      return { success: false, error: 'Failed to update goal' }
    }
  }, [goals, persistGoals])
  
  const toggleGoal = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    const goal = goals.find(g => g.id === id)
    if (!goal) {
      return { success: false, error: 'Goal not found' }
    }
    
    return updateGoal(id, { completed: !goal.completed })
  }, [goals, updateGoal])
  
  const deleteGoal = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedGoals = goals.filter(goal => goal.id !== id)
      
      setGoals(updatedGoals)
      persistGoals(updatedGoals)
      
      return { success: true }
    } catch (err) {
      console.error('Failed to delete goal:', err)
      return { success: false, error: 'Failed to delete goal' }
    }
  }, [goals, persistGoals])
  
  const reorderGoals = useCallback((startIndex: number, endIndex: number) => {
    try {
      const result = Array.from(goals)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      
      setGoals(result)
      persistGoals(result)
    } catch (err) {
      console.error('Failed to reorder goals:', err)
      setError('Failed to reorder goals')
    }
  }, [goals, persistGoals])
  
  const clearCompleted = useCallback(() => {
    try {
      const updatedGoals = goals.filter(goal => !goal.completed)
      
      setGoals(updatedGoals)
      persistGoals(updatedGoals)
    } catch (err) {
      console.error('Failed to clear completed goals:', err)
      setError('Failed to clear completed goals')
    }
  }, [goals, persistGoals])
  
  // Computed values
  const completedGoals = goals.filter(goal => goal.completed)
  const pendingGoals = goals.filter(goal => !goal.completed)
  const completionRate = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0
  const totalEstimatedTime = goals.reduce((total, goal) => total + goal.estimatedMinutes, 0)
  const completedEstimatedTime = completedGoals.reduce((total, goal) => total + goal.estimatedMinutes, 0)
  
  return {
    goals,
    isLoading,
    error,
    addGoal,
    updateGoal,
    toggleGoal,
    deleteGoal,
    reorderGoals,
    clearCompleted,
    completedGoals,
    pendingGoals,
    completionRate,
    totalEstimatedTime,
    completedEstimatedTime
  }
}
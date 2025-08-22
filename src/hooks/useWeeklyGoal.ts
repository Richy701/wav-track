import { useState, useCallback } from 'react'

const WEEKLY_GOAL_KEY = 'wavtrack_weekly_goal'
const DEFAULT_WEEKLY_GOAL = 10 // 10 hours default

export function useWeeklyGoal() {
  const [weeklyGoal, setWeeklyGoalState] = useState(() => {
    const saved = localStorage.getItem(WEEKLY_GOAL_KEY)
    return saved ? parseFloat(saved) : DEFAULT_WEEKLY_GOAL
  })

  const setWeeklyGoal = useCallback((goal: number) => {
    if (goal > 0 && goal <= 100) {
      setWeeklyGoalState(goal)
      localStorage.setItem(WEEKLY_GOAL_KEY, goal.toString())
    }
  }, [])

  return {
    weeklyGoal,
    setWeeklyGoal
  }
}
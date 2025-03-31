import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Achievement, UserAchievement } from '@/lib/types'
import React from 'react'

// One-time diagnostic check
let hasRunDiagnostics = false

export function useAchievements() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Run diagnostics once
  React.useEffect(() => {
    if (!hasRunDiagnostics && user) {
      const runDiagnostics = async () => {
        console.log('Running achievements diagnostics...')
        
        try {
          // Check if achievements table exists and has data
          const { data: achievements, error: achievementsError } = await supabase
            .from('achievements')
            .select('*')
          
          if (achievementsError) {
            console.error('Error checking achievements table:', achievementsError)
          } else {
            console.log('Achievements in database:', achievements?.length || 0)
            if (achievements?.length) {
              console.log('Sample achievement:', achievements[0])
            }
          }

          // Check if user_achievements table exists
          const { data: userAchievements, error: userAchievementsError } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', user.id)
          
          if (userAchievementsError) {
            console.error('Error checking user_achievements table:', userAchievementsError)
          } else {
            console.log('User achievements in database:', userAchievements?.length || 0)
            if (userAchievements?.length) {
              console.log('Sample user achievement:', userAchievements[0])
            }
          }

          // Check if projects table exists
          const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_deleted', false)
          
          if (projectsError) {
            console.error('Error checking projects table:', projectsError)
          } else {
            console.log('Active projects in database:', projects?.length || 0)
            if (projects?.length) {
              console.log('Sample project:', projects[0])
            }
          }

        } catch (error) {
          console.error('Error running diagnostics:', error)
        }
        
        hasRunDiagnostics = true
      }

      runDiagnostics()
    }
  }, [user])

  const { data: achievements = [], isLoading, error } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user found in useAchievements')
        return []
      }

      console.log('Fetching achievements for user:', user.id)

      try {
        // First fetch active projects to get accurate counts
        const { data: activeProjects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_deleted', false)

        if (projectsError) {
          console.error('Error fetching projects:', projectsError)
          throw projectsError
        }

        console.log('Active projects:', activeProjects?.length || 0)

        // Calculate achievement progress based on active projects
        const totalBeats = activeProjects?.length || 0
        const completedProjects = activeProjects?.filter(p => p.status === 'completed').length || 0

        console.log('Total beats:', totalBeats)
        console.log('Completed projects:', completedProjects)

        // Fetch all achievements from the database
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('tier', { ascending: true })

        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError)
          throw achievementsError
        }

        console.log('All achievements:', allAchievements?.length || 0)

        // Fetch user's achievements from the database
        const { data: userAchievements, error: fetchError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)

        if (fetchError) {
          console.error('Error fetching user achievements:', fetchError)
          throw fetchError
        }

        console.log('User achievements:', userAchievements?.length || 0)

        // Map the achievements data with user progress
        const mappedAchievements = allAchievements.map(achievement => {
          const userAchievement = userAchievements?.find(
            ua => ua.achievement_id === achievement.id
          )

          // Calculate progress based on achievement category
          let progress = userAchievement?.progress || 0
          if (achievement.category === 'production') {
            progress = totalBeats
          } else if (achievement.id === 'finish_what_you_start') {
            progress = completedProjects
          }

          // Ensure progress is never negative
          progress = Math.max(0, progress)

          return {
            ...achievement,
            progress,
            total: achievement.requirement,
            unlocked_at: userAchievement?.unlocked_at || null
          }
        })

        console.log('Mapped achievements:', mappedAchievements.length)

        return mappedAchievements
      } catch (error) {
        console.error('Error in useAchievements:', error)
        throw error
      }
    },
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  })

  // Subscribe to project changes to update achievements
  React.useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Project changes detected, invalidating achievements query')
          queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, queryClient])

  const updateAchievementProgress = async (
    achievementId: string,
    progress: number,
    total: number
  ) => {
    if (!user) return

    try {
      const achievement = achievements.find(a => a.id === achievementId)
      if (!achievement) return

      // Ensure progress is never negative
      progress = Math.max(0, progress)

      const isUnlocked = progress >= total
      const now = new Date().toISOString()

      console.log('Updating achievement progress:', {
        achievementId,
        progress,
        total,
        isUnlocked
      })

      // Update or insert the user achievement
      const { error: upsertError } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          progress,
          total,
          unlocked_at: isUnlocked ? now : null
        })

      if (upsertError) {
        console.error('Error updating achievement:', upsertError)
        throw upsertError
      }

      console.log('Achievement progress updated successfully')

      // Invalidate achievements query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
    } catch (err) {
      console.error('Error in updateAchievementProgress:', err)
      throw err
    }
  }

  return {
    achievements,
    loading: isLoading,
    error,
    updateAchievementProgress
  }
} 
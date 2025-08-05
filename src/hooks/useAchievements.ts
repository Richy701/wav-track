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

  // Test database connectivity on mount
  React.useEffect(() => {
    if (user) {
      console.log('[Debug] Testing database connectivity for user:', user.id)
      supabase.from('achievements').select('count').limit(1)
        .then(({ data, error }) => {
          if (error) {
            console.error('[Debug] Database connectivity test failed:', error)
          } else {
            console.log('[Debug] Database connectivity test passed, can access achievements table')
          }
        })
    }
  }, [user])

  // Removed diagnostics to improve performance

  const { data: achievements = [], isLoading, error } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[Debug] No user found in achievements query')
        return []
      }

      console.log('[Debug] Starting achievements query for user:', user.id)

      try {
        console.log('[Debug] Starting parallel data fetching for achievements')
        
        // Fetch all data in parallel for better performance
        const [
          beatActivitiesResult,
          activeProjectsResult,
          allAchievementsResult
        ] = await Promise.all([
          supabase
            .from('beat_activities')
            .select('count')
            .eq('user_id', user.id),
          supabase
            .from('projects')
            .select('status')
            .eq('user_id', user.id)
            .eq('is_deleted', false),
          supabase
            .from('achievements')
            .select('*')
            .order('tier', { ascending: true })
        ])

        // Check for errors in parallel results
        if (beatActivitiesResult.error) {
          console.error('[Debug] Error fetching beat activities:', beatActivitiesResult.error)
          throw beatActivitiesResult.error
        }
        if (activeProjectsResult.error) {
          console.error('[Debug] Error fetching projects:', activeProjectsResult.error)
          throw activeProjectsResult.error
        }
        if (allAchievementsResult.error) {
          console.error('[Debug] Error fetching achievements:', allAchievementsResult.error)
          throw allAchievementsResult.error
        }

        // Extract data from results
        const beatActivities = beatActivitiesResult.data
        const activeProjects = activeProjectsResult.data
        let allAchievements = allAchievementsResult.data

        console.log('[Debug] Parallel fetch completed:', {
          beatActivities: beatActivities?.length || 0,
          projects: activeProjects?.length || 0,
          achievements: allAchievements?.length || 0
        })

        // Calculate stats efficiently
        const totalBeats = beatActivities?.reduce((sum, activity) => sum + (activity.count || 0), 0) || 0
        const completedProjects = activeProjects?.filter(p => p.status === 'completed').length || 0

        // If no achievements exist, initialize them
        if (!allAchievements || allAchievements.length === 0) {
          console.log('[Debug] No achievements found, attempting to initialize default achievements')
          
          // Define default achievements - only ones that match current app functionality
          const defaultAchievements = [
            {
              id: 'first_beat',
              name: 'First Beat',
              description: 'Create your first beat',
              icon: '🎵',
              tier: 'bronze',
              category: 'production',
              requirement: 1
            },
            {
              id: 'beat_builder',
              name: 'Beat Builder',
              description: 'Create 10 beats',
              icon: '🎼',
              tier: 'silver',
              category: 'production',
              requirement: 10
            },
            {
              id: 'beat_machine',
              name: 'Beat Machine',
              description: 'Create 25 beats',
              icon: '🎹',
              tier: 'gold',
              category: 'production',
              requirement: 25
            },
            {
              id: 'legendary_producer',
              name: 'Legendary Producer',
              description: 'Create 50+ beats',
              icon: '👑',
              tier: 'platinum',
              category: 'production',
              requirement: 50
            },
            {
              id: 'finish_what_you_start',
              name: 'Finisher',
              description: 'Complete your first project',
              icon: '✅',
              tier: 'bronze',
              category: 'production',
              requirement: 1
            },
            {
              id: 'project_master',
              name: 'Project Master',
              description: 'Complete 5 projects',
              icon: '🏆',
              tier: 'gold',
              category: 'production',
              requirement: 5
            }
          ]

          try {
            // Insert default achievements
            console.log('[Debug] Inserting default achievements')
            const { data: insertedAchievements, error: insertError } = await supabase
              .from('achievements')
              .insert(defaultAchievements)
              .select()

            if (insertError) {
              console.error('[Debug] Error inserting default achievements:', insertError)
              // If insert fails, maybe they already exist, let's try to fetch them again
              console.log('[Debug] Retrying to fetch achievements after insert failure')
              const { data: retryAchievements, error: retryError } = await supabase
                .from('achievements')
                .select('*')
                .order('tier', { ascending: true })
              
              if (retryError) {
                console.error('[Debug] Retry fetch also failed:', retryError)
                throw retryError
              }
              
              allAchievements = retryAchievements || []
            } else {
              console.log('[Debug] Successfully inserted default achievements:', insertedAchievements?.length)
              allAchievements = insertedAchievements
            }
          } catch (insertError) {
            console.error('[Debug] Failed to initialize achievements:', insertError)
            // Return empty array instead of throwing to prevent complete failure
            return []
          }
        }

        // Fetch user achievements in parallel with optimization
        console.log('[Debug] Fetching user achievements for user:', user.id)
        const { data: userAchievements, error: fetchError } = await supabase
          .from('user_achievements')
          .select('achievement_id, progress, unlocked_at')
          .eq('user_id', user.id)

        if (fetchError) {
          console.error('[Debug] Error fetching user achievements:', fetchError)
          throw fetchError
        }

        console.log('[Debug] User achievements fetched:', userAchievements?.length || 0, 'records')

        // Create a map for faster lookups
        const userAchievementMap = new Map(
          userAchievements?.map(ua => [ua.achievement_id, ua]) || []
        )

        // Map achievements with optimized progress calculation - avoid concurrent updates
        const achievementUpdatePromises: Promise<any>[] = []
        const mappedAchievements = allAchievements.map(achievement => {
          const userAchievement = userAchievementMap.get(achievement.id)

          // Calculate progress based on achievement category
          let progress = userAchievement?.progress || 0
          if (achievement.category === 'production') {
            // For production achievements, calculate progress based on total beats
            progress = Math.min(totalBeats, achievement.requirement)
          } else if (achievement.id === 'finish_what_you_start') {
            progress = completedProjects
          }

          // Ensure progress is never negative
          progress = Math.max(0, progress)

          // Check if achievement should be unlocked
          const isUnlocked = progress >= achievement.requirement
          const unlocked_at = isUnlocked ? userAchievement?.unlocked_at || new Date().toISOString() : null

          const mappedAchievement = {
            ...achievement,
            progress,
            total: achievement.requirement,
            unlocked_at
          }


          // Queue achievement updates to prevent conflicts - don't run them immediately
          if (isUnlocked && !userAchievement?.unlocked_at) {
            console.log('[Debug] Queueing achievement unlock:', achievement.name, 'Progress:', progress, 'Required:', achievement.requirement)
            const updatePromise = updateAchievementProgress(achievement.id, progress, achievement.requirement)
              .then(() => {
                console.log('[Debug] Achievement unlocked successfully:', achievement.name)
              })
              .catch((error) => {
                console.error('[Debug] Error unlocking achievement:', achievement.name, error)
              })
            achievementUpdatePromises.push(updatePromise)
          } else if (!isUnlocked && userAchievement && userAchievement.progress !== progress) {
            // Only update if progress has actually changed
            console.log('[Debug] Queueing achievement progress update:', achievement.name, `${userAchievement.progress} -> ${progress}/${achievement.requirement}`)
            const updatePromise = updateAchievementProgress(achievement.id, progress, achievement.requirement)
              .then(() => {
                console.log('[Debug] Achievement progress updated successfully:', achievement.name, `${progress}/${achievement.requirement}`)
              })
              .catch((error) => {
                console.error('[Debug] Error updating achievement progress:', achievement.name, error)
              })
            achievementUpdatePromises.push(updatePromise)
          }

          return mappedAchievement
        })

        // Process achievement updates sequentially to avoid conflicts
        if (achievementUpdatePromises.length > 0) {
          console.log('[Debug] Processing', achievementUpdatePromises.length, 'queued achievement updates')
          // Process updates one by one with small delays to avoid conflicts
          Promise.resolve().then(async () => {
            for (let i = 0; i < achievementUpdatePromises.length; i++) {
              try {
                await achievementUpdatePromises[i]
                // Small delay between updates to prevent conflicts
                if (i < achievementUpdatePromises.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 50))
                }
              } catch (error) {
                console.error('[Debug] Error processing achievement update:', error)
              }
            }
            // Refresh achievement data after all updates
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
            }, 100)
          })
        }

        console.log('[Debug] Returning mapped achievements:', mappedAchievements.length)
        return mappedAchievements
      } catch (error) {
        console.error('[Debug] Error in achievements query:', error)
        throw error
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      console.error('[Debug] Achievement query retry:', failureCount, error)
      return failureCount < 3
    }
  })

  // Subscribe to project changes to update achievements
  React.useEffect(() => {
    if (!user) return

    // Create a channel for projects, user_achievements, and beat_activities changes
    const channel = supabase
      .channel('achievement_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beat_activities',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
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


      // Try to update first, then insert if doesn't exist
      const { data: existingRecord } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .single()

      let upsertError = null

      if (existingRecord) {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({
            progress,
            total,
            unlocked_at: isUnlocked ? now : null
          })
          .eq('user_id', user.id)
          .eq('achievement_id', achievementId)
        
        upsertError = updateError
      } else {
        // Record doesn't exist, insert it
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievementId,
            progress,
            total,
            unlocked_at: isUnlocked ? now : null
          })
        
        upsertError = insertError
      }

      if (upsertError) {
        console.error('[Debug] Error in updateAchievementProgress:', upsertError)
        throw upsertError
      }

      // Invalidate achievements query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['achievements', user.id] })
    } catch (err) {
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
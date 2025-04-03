import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, Target, Plus, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { Database } from '@/integrations/supabase/types'
import { AddSessionGoalModal } from './AddSessionGoalModal'

type Goal = Database['public']['Tables']['session_goals']['Row']

export const SessionGoalCard: React.FC = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isAddingGoal, setIsAddingGoal] = React.useState(false)

  // Query for active goal
  const { data: activeGoal, isLoading } = useQuery({
    queryKey: ['active-goal'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('session_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching active goal:', error)
        throw error
      }

      return data as Goal
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for creating goal
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: { title: string; description: string; duration: number }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('session_goals')
        .insert([
          {
            user_id: user.id,
            goal_text: goalData.title,
            description: goalData.description,
            expected_duration_minutes: goalData.duration,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating goal:', error)
        throw error
      }

      return data as Goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-goal'] })
      setIsAddingGoal(false)
      toast({
        title: "Goal Created",
        description: "Your session goal has been created successfully",
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('Error in createGoalMutation:', error)
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  // Mutation for completing goal
  const completeGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { data, error } = await supabase
        .from('session_goals')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single()

      if (error) {
        console.error('Error completing goal:', error)
        throw error
      }

      return data as Goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-goal'] })
      toast({
        title: "Goal Completed",
        description: "Your session goal has been marked as complete",
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('Error in completeGoalMutation:', error)
      toast({
        title: "Error",
        description: "Failed to complete goal. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  })

  const handleComplete = async (goalId: string) => {
    try {
      await completeGoalMutation.mutateAsync(goalId)
    } catch (error) {
      // Error handling is done in mutation
    }
  }

  const handleCreateGoal = async (goalData: { title: string; description: string; duration: number }) => {
    try {
      await createGoalMutation.mutateAsync(goalData)
    } catch (error) {
      // Error handling is done in mutation
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-orange-500/10 via-[#111111]/50 to-[#111111]/50 border border-orange-500/20 p-6 backdrop-blur-xl animate-pulse">
        <div className="h-4 bg-orange-500/20 rounded w-24 mb-4"></div>
        <div className="h-4 bg-orange-500/20 rounded w-full mb-4"></div>
        <div className="h-4 bg-orange-500/20 rounded w-32"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-xl bg-gradient-to-br from-orange-500/10 via-[#111111]/50 to-[#111111]/50 border border-orange-500/20 p-6 backdrop-blur-xl hover:border-orange-500/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-medium">Session Goal</h3>
        </div>
        {!activeGoal && !isAddingGoal && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10"
            onClick={() => setIsAddingGoal(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Goal
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeGoal ? (
          <motion.div
            key="active-goal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                {activeGoal.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
              <span className="text-xs text-white/50">
                {formatDistanceToNow(new Date(activeGoal.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-white/70 font-medium">
                {activeGoal.goal_text}
              </p>

              {activeGoal.description && (
                <p className="text-sm text-white/50">
                  {activeGoal.description}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-400/70" />
                <span className="text-xs text-white/50">
                  {activeGoal.expected_duration_minutes > 0 
                    ? `${activeGoal.expected_duration_minutes} min`
                    : 'No duration set'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => handleComplete(activeGoal.id)}
              className={cn(
                "w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white",
                "transition-colors duration-200",
                "flex items-center justify-center space-x-2",
                "rounded-lg py-2"
              )}
            >
              <Check className="w-4 h-4" />
              <span>Mark Complete</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center text-center py-8"
          >
            <Target className="w-8 h-8 text-orange-400/70 mb-4" />
            <p className="text-sm text-white/70 mb-2">No active session goal</p>
            <p className="text-xs text-white/50 mb-4">Add a goal to get started</p>
            <Button
              onClick={() => setIsAddingGoal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddSessionGoalModal
        isOpen={isAddingGoal}
        onClose={() => setIsAddingGoal(false)}
        onSubmit={handleCreateGoal}
      />
    </motion.div>
  )
} 
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
import { NewSessionGoalForm } from './NewSessionGoalForm'

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

  if (!activeGoal || isAddingGoal) {
    return <NewSessionGoalForm onSubmit={handleCreateGoal} />
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
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10"
          onClick={() => setIsAddingGoal(true)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Goal
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
            {activeGoal.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
          <span className="text-xs text-neutral-500">
            {formatDistanceToNow(new Date(activeGoal.created_at), { addSuffix: true })}
          </span>
        </div>

        <div>
          <h4 className="text-base font-medium mb-2">{activeGoal.goal_text}</h4>
          {activeGoal.description && (
            <p className="text-sm text-neutral-400">{activeGoal.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>{activeGoal.expected_duration_minutes} minutes</span>
          </div>
          {activeGoal.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => handleComplete(activeGoal.id)}
            >
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
} 
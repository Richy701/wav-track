import React, { useEffect, useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Target, Play, Pause, RotateCcw, Settings, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import type { User as UserType } from '@supabase/supabase-js'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BaseLayout } from '@/components/layout'
import { useLocalStorage } from '@/hooks/use-local-storage'

type Goal = {
  id: string
  user_id: string
  goal_text: string
  description: string | null
  expected_duration_minutes: number
  status: 'pending' | 'completed'
  created_at: string
  updated_at: string | null
}

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goal: { title: string; description: string; duration: number }) => void
}

const AddGoalModal = ({ isOpen, onClose, onSave }: AddGoalModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(25)

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        duration
      })
      setTitle('')
      setDescription('')
      setDuration(25)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Session Goal</DialogTitle>
          <DialogDescription>
            What do you want to accomplish in this session?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="title">Goal</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Create a lo-fi beat"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your goal"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration: {duration} minutes</Label>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              min={5}
              max={120}
              step={5}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Set Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Sessions: React.FC = () => {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<UserType | null>(null)
  const { toast } = useToast()
  
  // Timer state
  const [isWorking, setIsWorking] = useLocalStorage<boolean>('timer-is-working', true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useLocalStorage<number>('timer-time-left', 25 * 60)
  const [workDuration, setWorkDuration] = useLocalStorage<number>('timer-work-duration', 25)
  const [breakDuration, setBreakDuration] = useLocalStorage<number>('timer-break-duration', 5)
  
  // Goal state
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getCurrentUser()
  }, [])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsPlaying(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, timeLeft, setTimeLeft])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setTimeLeft(isWorking ? workDuration * 60 : breakDuration * 60)
  }, [isWorking, workDuration, breakDuration, setTimeLeft])

  const handleModeChange = useCallback((working: boolean) => {
    setIsWorking(working)
    setIsPlaying(false)
    setTimeLeft(working ? workDuration * 60 : breakDuration * 60)
  }, [workDuration, breakDuration, setIsWorking, setTimeLeft])

  const onWorkDurationChange = useCallback((duration: number) => {
    setWorkDuration(duration)
    if (isWorking) {
      setTimeLeft(duration * 60)
    }
  }, [isWorking, setWorkDuration, setTimeLeft])

  const onBreakDurationChange = useCallback((duration: number) => {
    setBreakDuration(duration)
    if (!isWorking) {
      setTimeLeft(duration * 60)
    }
  }, [isWorking, setBreakDuration, setTimeLeft])

  // Fetch goals
  const { data: goals = [] } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const { data, error } = await supabase
        .from('session_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
  })

  // Fetch stats
  const { data: beatsCount } = useQuery({
    queryKey: ['beats-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0
      
      const { data, error } = await supabase
        .from('beat_activities')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      if (error) throw error
      return data?.length || 0
    },
    enabled: !!user?.id,
  })

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async ({ title, description, duration }: { title: string; description: string; duration: number }) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('session_goals')
        .insert({
          goal_text: title,
          description: description || null,
          expected_duration_minutes: duration,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] })
      toast({
        title: "Goal Set!",
        description: "Your session goal has been created",
        duration: 3000,
      })
    }
  })

  // Find active goal
  useEffect(() => {
    const pendingGoal = goals.find(goal => goal.status === 'pending')
    setActiveGoal(pendingGoal || null)
  }, [goals])

  const completeGoal = async () => {
    if (!activeGoal || !user?.id) return
    
    try {
      const { error } = await supabase
        .from('session_goals')
        .update({ status: 'completed' })
        .eq('id', activeGoal.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['goals', user.id] })
      setActiveGoal(null)

      toast({
        title: "Goal Completed! 🎉",
        description: "Great work on completing your session goal",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error completing goal:', error)
    }
  }

  const completedGoals = goals.filter(goal => goal.status === 'completed').length
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <BaseLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-12">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Focus Session
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Create beats with focused productivity
            </p>
          </div>

          {/* Timer */}
          <div className="flex justify-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-900 rounded-[2rem] p-16 shadow-2xl border border-neutral-200 dark:border-neutral-800"
            >
              
              {/* Mode Toggle */}
              <div className="flex justify-center mb-12">
                <div className="flex items-center p-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <button
                    onClick={() => handleModeChange(true)}
                    className={cn(
                      "px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200",
                      isWorking
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-neutral-600 dark:text-neutral-400"
                    )}
                  >
                    Focus
                  </button>
                  <button
                    onClick={() => handleModeChange(false)}
                    className={cn(
                      "px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200",
                      !isWorking
                        ? "bg-violet-500 text-white shadow-lg"
                        : "text-neutral-600 dark:text-neutral-400"
                    )}
                  >
                    Break
                  </button>
                </div>
              </div>

              {/* Timer Circle */}
              <div className="flex justify-center mb-12">
                <div className="relative">
                  <div className="w-80 h-80">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        className="text-neutral-200 dark:text-neutral-700"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeLinecap="round"
                        className={cn(
                          "transition-colors duration-300",
                          isWorking ? "text-emerald-500" : "text-violet-500"
                        )}
                        animate={{
                          strokeDashoffset: `${2 * Math.PI * 45 - (((isWorking ? workDuration * 60 : breakDuration * 60) - timeLeft) / (isWorking ? workDuration * 60 : breakDuration * 60)) * 2 * Math.PI * 45}` 
                        }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={cn(
                          "text-6xl font-bold tracking-tight transition-colors duration-300",
                          isWorking ? "text-emerald-600 dark:text-emerald-400" : "text-violet-600 dark:text-violet-400"
                        )}>
                          {formatTime(timeLeft)}
                        </div>
                        <div className="text-xl text-neutral-500 dark:text-neutral-400 mt-3">
                          {isWorking ? "Focus Time" : "Break Time"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-base"
                >
                  <RotateCcw className="w-5 h-5 mr-3" />
                  Reset
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className={cn(
                    "px-12 py-4 text-xl font-semibold",
                    isWorking
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-violet-600 hover:bg-violet-700"
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6 mr-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-3" />
                      Start
                    </>
                  )}
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="lg" className="px-8 py-4 text-base">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Focus Duration: {workDuration} minutes
                        </label>
                        <Slider
                          value={[workDuration]}
                          onValueChange={(value) => onWorkDurationChange(value[0])}
                          min={5}
                          max={60}
                          step={5}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Break Duration: {breakDuration} minutes
                        </label>
                        <Slider
                          value={[breakDuration]}
                          onValueChange={(value) => onBreakDurationChange(value[0])}
                          min={1}
                          max={15}
                          step={1}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>
          </div>

          {/* Goal Section */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Session Goal
                </h2>
                {!activeGoal && (
                  <Button
                    onClick={() => setIsAddGoalModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Set Goal
                  </Button>
                )}
              </div>

              {activeGoal ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      {activeGoal.goal_text}
                    </h3>
                    <Button
                      onClick={completeGoal}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                  {activeGoal.description && (
                    <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                      {activeGoal.description}
                    </p>
                  )}
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {activeGoal.expected_duration_minutes} minutes
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">No active goal set</p>
                  <p>Set a goal to stay focused and track your progress</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Simple Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-6"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 text-center shadow-xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {beatsCount ?? 0}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">
                Beats Created
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 text-center shadow-xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">
                {completedGoals}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">
                Goals Completed
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 text-center shadow-xl border border-neutral-200 dark:border-neutral-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {completionRate}%
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 font-medium">
                Success Rate
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add Goal Modal */}
        <AddGoalModal
          isOpen={isAddGoalModalOpen}
          onClose={() => setIsAddGoalModalOpen(false)}
          onSave={(goal) => {
            createGoalMutation.mutate({
              title: goal.title,
              description: goal.description,
              duration: goal.duration
            })
            setIsAddGoalModalOpen(false)
          }}
        />
      </div>
    </BaseLayout>
  )
}

export default Sessions

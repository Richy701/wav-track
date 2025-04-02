import React, { useState, useEffect } from 'react'
import { Clock, Play, Pause, X, Target, Timer, ChartLine, Trophy, Plus, Check, Pencil, Fire, Trash, CaretDown, Headphones, Stop } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Session, SessionStats } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface SessionsOverviewProps {
  onStartSession?: () => void
}

export function SessionsOverview({ onStartSession }: SessionsOverviewProps) {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [sessionGoal, setSessionGoal] = useState('')
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState<{
    goalCompleted: boolean
    feedback: Session['feedback']
  }>({
    goalCompleted: false,
    feedback: '😐'
  })
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Fetch sessions and stats
  const fetchSessions = async () => {
    if (!user) return

    try {
      // Fetch recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (sessionsError) throw sessionsError

      // Find active session and handle null values
      const activeSession = sessionsData?.find(s => s.status === 'active') || null
      setActiveSession(activeSession as Session)
      setIsSessionActive(!!activeSession)
      
      // Handle null values in sessions data
      const processedSessions = (sessionsData || []).map(session => ({
        ...session,
        notes: session.notes || undefined,
        productivity_score: session.productivity_score || 0,
        tags: session.tags || [],
      })) as Session[]
      
      setRecentSessions(processedSessions)

      // Calculate stats
      if (processedSessions.length > 0) {
        const totalDuration = processedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        const avgDuration = totalDuration / processedSessions.length
        const productivityScore = processedSessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / processedSessions.length

        setStats({
          totalDuration,
          averageDuration: avgDuration,
          totalSessions: processedSessions.length,
          productivityScore,
          mostProductiveTime: null,
          recentSessions: processedSessions,
          currentStreak: 0,
          bestStreak: 0,
        })
      } else {
        setStats(null)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchSessions()
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchSessions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleStartSession = async () => {
    if (!user) return

    try {
      const newSession = {
        user_id: user.id,
        created_at: new Date().toISOString(),
        status: 'active' as const,
        duration: 1,
        tags: [],
        productivity_score: 0
      }

      // Optimistic update
      const optimisticSession = { ...newSession, id: 'temp-' + Date.now() } as Session
      setActiveSession(optimisticSession)
      setIsSessionActive(true)
      setShowGoalInput(false)

      const { data, error } = await supabase
        .from('sessions')
        .insert([newSession])
        .select()
        .single()

      if (error) {
        // Revert optimistic update on error
        setActiveSession(null)
        setIsSessionActive(false)
        throw error
      }

      toast.success('Session started')
      onStartSession?.()
    } catch (error) {
      console.error('Error starting session:', error)
      toast.error('Failed to start session')
    }
  }

  const handleEndSession = async () => {
    if (!activeSession) return

    try {
      // Optimistic update
      const optimisticSessions = recentSessions.map(session => 
        session.id === activeSession.id 
          ? { ...session, status: 'completed' as const, ended_at: new Date().toISOString() }
          : session
      )
      setRecentSessions(optimisticSessions)
      setActiveSession(null)
      setIsSessionActive(false)
      setShowReflection(false)
      setReflection({ goalCompleted: false, feedback: '😐' })

      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          goal_completed: reflection.goalCompleted,
          feedback: reflection.feedback,
        })
        .eq('id', activeSession.id)

      if (error) {
        // Revert optimistic update on error
        fetchSessions()
        throw error
      }

      toast.success('Session ended')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (error) {
      console.error('Error ending session:', error)
      toast.error('Failed to end session')
    }
  }

  const handleSaveGoal = () => {
    if (sessionGoal.trim()) {
      setShowGoalInput(false)
      toast.success('Goal saved')
    }
  }

  const handleClearSessions = async () => {
    if (!user) return
    setIsClearing(true)
    
    try {
      // Optimistic update
      setRecentSessions([])
      setStats(null)

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'completed')

      if (error) {
        // Revert optimistic update on error
        fetchSessions()
        throw error
      }

      toast.success('Sessions cleared')
    } catch (error) {
      console.error('Error clearing sessions:', error)
      toast.error('Failed to clear sessions')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-lg p-3",
        "bg-gradient-to-b from-muted/5 to-muted/10 dark:from-muted/10 dark:to-muted/20",
        "border border-border/50 shadow-lg",
        "h-[421px]",
        "hover:scale-[1.002] hover:shadow-xl transition-all duration-300 ease-in-out",
        activeSession && "border-l-4 border-l-primary/40"
      )}
    >
      {/* Content */}
      <div className="relative flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-1 rounded-lg bg-purple-200/40 dark:bg-purple-600/20 shadow-sm border border-purple-200/50 dark:border-purple-500/20"
            >
              <Clock className="h-3.5 w-3.5 text-primary animate-pulse" weight="fill" />
            </motion.div>
            <h3 className="font-medium text-xs text-foreground">Studio Sessions</h3>
          </div>
          <AnimatePresence mode="wait">
            {activeSession ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20"
              >
                <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-medium text-orange-500">Recording</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 dark:bg-green-500/20 border border-green-500/20"
              >
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-green-500">Ready</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/5 dark:bg-muted/10 group">
              <Timer className="w-3 h-3 text-[#FACC15]/70 group-hover:text-[#FACC15]" />
              <span>{Math.round(stats.averageDuration)}m avg</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/5 dark:bg-muted/10 group">
              <ChartLine className="w-3 h-3 text-[#60A5FA]/70 group-hover:text-[#60A5FA]" />
              <span>{Math.round(stats.productivityScore * 100)}% productivity</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/5 dark:bg-muted/10 group">
              <Trophy className="w-3 h-3 text-[#A78BFA]/70 group-hover:text-[#A78BFA]" />
              <span>{stats.totalSessions} sessions</span>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/5 dark:bg-muted/10 group">
              <Target className="w-3 h-3 text-[#34D399]/70 group-hover:text-[#34D399]" />
              <span>{Math.round(stats.totalDuration)}m total</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border/20 mb-2" />

        {/* Recent Activity */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-medium text-muted-foreground">Recent Activity</h4>
            {recentSessions.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                      onClick={handleClearSessions}
                      disabled={isClearing}
                    >
                      <Trash className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Clear recent sessions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <AnimatePresence mode="popLayout">
            {recentSessions.length > 0 ? (
              <div className="text-xs text-muted-foreground space-y-0.5">
                {(showAllSessions ? recentSessions : recentSessions.slice(0, 3)).map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-1 rounded-lg bg-muted/5 dark:bg-muted/10 hover:bg-muted/10 dark:hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {session.goal || 'Studio Session'}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium">
                        {session.duration}m
                      </span>
                      <span className="text-[10px] font-medium">
                        {session.productivity_score}/10
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full py-8 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.3, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-center"
                >
                  <Timer className="w-14 h-14 text-muted-foreground/20" weight="thin" />
                </motion.div>
                <h4 className="mt-4 text-sm font-medium text-foreground">No studio sessions yet</h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                  Start your first session to begin tracking your music productivity.
                </p>
              </motion.div>
            )}
            {recentSessions.length > 3 && !showAllSessions && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAllSessions(true)}
                className="w-full mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <CaretDown className="w-3 h-3" />
                View All
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 mt-2">
          <AnimatePresence mode="wait">
            {!isSessionActive ? (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-6"
                  onClick={handleStartSession}
                >
                  <Play className="w-2.5 h-2.5 mr-1" />
                  Start Session
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="stop"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleEndSession}
                >
                  <Stop className="w-2.5 h-2.5 mr-1" />
                  Stop Session
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
} 
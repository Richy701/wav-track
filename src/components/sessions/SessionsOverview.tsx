import React, { useState, useEffect } from 'react'
import { Clock, Play, Pause, X, Target, Timer, ChartLine, Trophy, Plus, Check, Pencil, Fire } from '@phosphor-icons/react'
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

  // Fetch sessions and stats
  useEffect(() => {
    if (!user) return

    const fetchSessions = async () => {
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
            currentStreak: 0, // To be implemented
            bestStreak: 0, // To be implemented
          })
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching sessions:', error)
        toast.error('Failed to load sessions')
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [user])

  const handleStartSession = async () => {
    if (!user) return

    try {
      const newSession = {
        user_id: user.id,
        created_at: new Date().toISOString(),
        status: 'active' as const,
        duration: 0,
        tags: [],
        goal: sessionGoal,
        productivity_score: 0,
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([newSession])
        .select()
        .single()

      if (error) throw error

      setActiveSession(data as Session)
      setShowGoalInput(false)
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
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          goal_completed: reflection.goalCompleted,
          feedback: reflection.feedback,
        })
        .eq('id', activeSession.id)

      if (error) throw error

      setActiveSession(null)
      setShowReflection(false)
      setReflection({ goalCompleted: false, feedback: '😐' })
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-lg p-6",
        "bg-gradient-to-b from-muted/5 to-muted/10 dark:from-muted/10 dark:to-muted/20",
        "border border-border/50 shadow-lg",
        activeSession && "border-l-4 border-l-primary/40"
      )}
    >
      {/* Content */}
      <div className="relative flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2 rounded-lg bg-purple-200/40 dark:bg-purple-600/20 shadow-sm border border-purple-200/50 dark:border-purple-500/20"
            >
              <Clock className="h-5 w-5 text-primary animate-pulse" weight="fill" />
            </motion.div>
            <h3 className="font-medium text-sm text-foreground">Studio Sessions</h3>
          </div>
          <AnimatePresence mode="wait">
            {activeSession ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-medium text-orange-500">Recording</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 dark:bg-green-500/20 border border-green-500/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-green-500">Ready</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Goal Setting Section */}
        <AnimatePresence>
          {!activeSession && !showGoalInput && !sessionGoal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary hover:text-primary/90 hover:bg-purple-500/10 dark:hover:bg-purple-400/10 transition-all duration-300 group shadow-sm hover:shadow-md"
                      onClick={() => setShowGoalInput(true)}
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Set a Session Goal
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clarify your focus before starting a session!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}

          {showGoalInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2"
            >
              <Input
                placeholder="What do you want to achieve in this session?"
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                className="text-xs border-primary/20 focus:border-primary/40"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSaveGoal}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save Goal
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowGoalInput(false)
                    setSessionGoal('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {sessionGoal && !showGoalInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 flex items-center gap-2 text-xs bg-purple-500/5 dark:bg-purple-500/10 p-2 rounded-lg border border-purple-200/50 dark:border-purple-500/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
            >
              <span className="text-primary">🎯</span>
              <span className="flex-1">{sessionGoal}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-purple-500/10 dark:hover:bg-purple-400/10"
                onClick={() => setShowGoalInput(true)}
              >
                <Pencil className="w-3 h-3 text-primary" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Sessions */}
        <div className="space-y-4">
          {isLoading ? (
            // Enhanced loading state
            [1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-muted/80 dark:bg-muted/60 border border-border shadow-sm flex items-center justify-center">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full animate-pulse',
                      i === 0 && 'bg-gradient-to-r from-violet-500 to-indigo-500',
                      i === 1 && 'bg-gradient-to-r from-blue-500 to-cyan-500',
                      i === 2 && 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                    )}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted/70 dark:bg-muted/50 rounded-md animate-pulse" />
                  <div className="h-3 w-16 bg-muted/60 dark:bg-muted/40 rounded-md animate-pulse" />
                </div>
              </motion.div>
            ))
          ) : (
            // Enhanced recent sessions
            recentSessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 group/item"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-full bg-muted/80 dark:bg-muted/60 border border-border shadow-sm flex items-center justify-center"
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full transition-colors duration-300',
                      i === 0 && 'bg-gradient-to-r from-violet-500 to-indigo-500',
                      i === 1 && 'bg-gradient-to-r from-blue-500 to-cyan-500',
                      i === 2 && 'bg-gradient-to-r from-fuchsia-500 to-pink-500'
                    )}
                  />
                </motion.div>
                <div className="flex-1">
                  <div className="text-sm font-medium group-hover/item:text-primary transition-colors">
                    {session.project_id ? 'Project Session' : 'Quick Session'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    {session.duration > 0 && ` · ${session.duration}m`}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Session Stats */}
        <div className="pt-4 border-t border-border/5 dark:border-border/10">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">
            Session Stats
          </h4>
          <ul className="space-y-2">
            {stats ? (
              <>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {stats.totalSessions} total sessions
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="w-2 h-2 rounded-full bg-primary/80" />
                  Avg. {Math.round(stats.averageDuration)}min per session
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  {Math.round(stats.productivityScore * 100)}% productivity score
                </motion.li>
                {stats.currentStreak > 3 && (
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-xs text-amber-500"
                  >
                    <Fire className="w-4 h-4 animate-pulse" weight="fill" />
                    {stats.currentStreak} day streak
                  </motion.li>
                )}
              </>
            ) : (
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground"
              >
                No sessions recorded yet
              </motion.li>
            )}
          </ul>
        </div>

        {/* Session Controls */}
        <div className="pt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {activeSession
              ? 'Recording in progress...'
              : 'Start tracking your studio time!'}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              variant={activeSession ? 'destructive' : 'default'}
              className={cn(
                "h-8 text-xs font-medium transition-all duration-300",
                activeSession 
                  ? "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              )}
              onClick={activeSession ? handleEndSession : handleStartSession}
            >
              {activeSession ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  End Session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" weight="fill" />
                  Start Session
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 
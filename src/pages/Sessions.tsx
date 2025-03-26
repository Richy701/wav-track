import React, { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AICoach } from '@/components/ai-coach/AICoach'
import { FadeIn } from '@/components/ui/fade-in'
import { Brain, Clock, Target, TrendingUp, Play, Pause, RotateCcw, Quote, ArrowLeft, BarChart, Coffee, Settings, Menu, Plus, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'
import { SessionCard } from '@/components/sessions/SessionCard'
import { useToast } from "@/components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Track } from '@/types/track'
import { User } from '@supabase/supabase-js'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Logo } from '@/components/logo'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  }
}

const buttonHoverVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98
  }
}

// Update card styles with enhanced gradients and effects
const cardStyles = {
  base: cn(
    "relative overflow-hidden rounded-xl",
    "bg-gradient-to-b from-white/80 to-white/60 dark:from-background/20 dark:to-background/5",
    "border border-zinc-200/80 dark:border-border/20",
    "shadow-sm dark:shadow-none",
    "transition-all duration-300"
  ),
  padding: "p-5 sm:p-6",
  innerCard: "relative z-10",
  highPriority: "border-l-4 border-l-rose-500/50 dark:border-l-rose-400/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]",
  mediumPriority: "border-l-4 border-l-amber-500/50 dark:border-l-amber-400/20 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  success: "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
  focus: cn(
    "border-l-4 border-l-emerald-500/50 dark:border-l-emerald-400/20",
    "hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
  ),
  hover: "hover:scale-[1.01] transform transition-all duration-200 ease-in-out",
  gradient: "bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-background/20 dark:via-background/15 dark:to-background/10",
  highlight: "after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/5 after:via-transparent after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity"
}

// Update button styles with enhanced gradients and effects
const buttonStyles = {
  gradient: cn(
    "relative w-full bg-emerald-600 hover:bg-emerald-700",
    "text-white font-medium",
    "shadow-md hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    "transition-all duration-200",
    "border border-emerald-500/20 dark:border-emerald-400/10",
    "hover:border-emerald-500/40 dark:hover:border-emerald-400/20",
    "rounded-md"
  ),
  outlineGradient: cn(
    "relative w-full bg-white hover:bg-emerald-50 dark:bg-background dark:hover:bg-emerald-900/20",
    "text-emerald-700 dark:text-emerald-400 font-medium",
    "border border-emerald-300 dark:border-emerald-800",
    "shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
    "transition-all duration-200",
    "hover:border-emerald-400 dark:hover:border-emerald-700",
    "rounded-md"
  )
}

// Update text styles with better contrast
const textStyles = {
  pageTitle: "text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent",
  cardTitle: "text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-foreground/90",
  cardSubtitle: "text-sm sm:text-base text-zinc-600 dark:text-muted-foreground/80",
  sectionTitle: "text-xs sm:text-sm font-medium text-zinc-600 dark:text-muted-foreground/80",
  bodyText: "text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-muted-foreground/80",
  timerText: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent",
  quoteText: "text-sm sm:text-base italic leading-relaxed text-zinc-600 dark:text-muted-foreground/80",
  attributionText: "text-xs text-zinc-500 dark:text-muted-foreground/70 mt-2",
  statusText: "text-xs font-medium",
  dateText: "text-xs text-zinc-500 dark:text-muted-foreground/70"
}

const Sessions: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isWorking, setIsWorking] = React.useState(true)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(25 * 60)
  const [activeProject, setActiveProject] = React.useState<string | null>(null)
  const [workDuration, setWorkDuration] = React.useState(25)
  const [breakDuration, setBreakDuration] = React.useState(5)

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      setIsPlaying(false)
      if (isWorking) {
        // Work session completed
        setTimeLeft(breakDuration * 60)
        setIsWorking(false)
        // Play notification sound and show toast
        new Audio('/notification.mp3').play().catch(() => {})
        toast({
          title: "Work Session Complete! 🎉",
          description: "Time for a break!",
          duration: 4000,
        })
      } else {
        // Break completed
        setTimeLeft(workDuration * 60)
        setIsWorking(true)
        // Play notification sound and show toast
        new Audio('/notification.mp3').play().catch(() => {})
        toast({
          title: "Break Complete! 💪",
          description: "Ready to get back to work?",
          duration: 4000,
        })
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, timeLeft, isWorking, toast, workDuration, breakDuration])

  // Handle mode changes
  const handleModeChange = useCallback((working: boolean) => {
    setIsPlaying(false)
    setIsWorking(working)
    setTimeLeft(working ? workDuration * 60 : breakDuration * 60)
  }, [workDuration, breakDuration])

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(playing => !playing)
  }, [])

  // Handle reset
  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setTimeLeft(isWorking ? workDuration * 60 : breakDuration * 60)
  }, [isWorking, workDuration, breakDuration])

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Calculate progress percentage for the circular timer
  const CIRCLE_RADIUS = 70
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
  const progress = ((isWorking ? workDuration * 60 : breakDuration * 60) - timeLeft) / (isWorking ? workDuration * 60 : breakDuration * 60) * CIRCLE_CIRCUMFERENCE

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('last_modified', { ascending: false })

      if (error) throw error
      return (data || []) as Project[]
    }
  })

  // Fetch project stats
  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      const projects = (data || []) as Project[]
      const totalProjects = projects.length
      const completedProjects = projects.filter(p => p.status === 'completed').length

      return {
        totalProjects,
        completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
      }
    }
  })

  // Mutations for project actions
  const completeProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const update: ProjectUpdate = { status: 'completed' }
      const { error } = await supabase
        .from('projects')
        .update(update)
        .eq('id', projectId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-stats'] })
    }
  })

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: ProjectUpdate }) => {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Project action handlers
  const handleCompleteProject = async (projectId: string) => {
    try {
      await completeProjectMutation.mutateAsync(projectId)
      toast({
        title: "Success",
        description: "Project marked as complete",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark project as complete",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = (projectId: string) => {
    // TODO: Implement edit modal
    toast({
      title: "Coming Soon",
      description: "Project editing will be available soon",
    })
  }

  const handlePlayProject = (projectId: string) => {
    setActiveProject(projectId)
    setIsPlaying(true)
    // TODO: Implement actual time tracking
  }

  const handlePauseProject = (projectId: string) => {
    setActiveProject(null)
    setIsPlaying(false)
    // TODO: Save progress
  }

  // Map project data to match session card structure and limit to last 3
  const mappedProjects = projects?.slice(0, 3).map(project => ({
    id: project.id,
    user_id: project.user_id,
    title: project.title,
    status: project.status === 'completed' ? 'completed' : 'in_progress',
    duration: '0', // We can calculate this if needed
    created_at: project.date_created,
    last_modified: project.last_modified,
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      genre: project.genre,
      bpm: project.bpm,
      key: project.key,
      completion_percentage: project.completion_percentage,
      audio_file: project.audio_file
    }
  })) || []

  return (
    <>
      {/* Navigation Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className={cn(
                  "w-9 h-9 rounded-full",
                  "bg-background/80 dark:bg-background/50",
                  "border border-border/50 dark:border-border/30",
                  "shadow-sm dark:shadow-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-all duration-300"
                )}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </motion.div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
              WavTrack
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-4">
              <Button
                variant="ghost"
                asChild
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 transform hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <Link to="/sessions">Sessions</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 transform hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <Link to="/profile">Profile</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 transform hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <Link to="/profile/settings">Settings</Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full"
                  aria-label="User menu"
                >
                  <span className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
                      R
                    </span>
                  </span>
                </Button>
              </div>
            </nav>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 transform hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8 mt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            variants={cardVariants}
            className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 lg:mb-8"
          >
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className={textStyles.pageTitle}>
              Production Sessions
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Pomodoro Timer Card */}
              <motion.div
                variants={cardVariants}
                className={cn(
                  "relative overflow-hidden rounded-xl",
                  "bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-background/20 dark:to-background/5",
                  "border border-emerald-200/70 dark:border-emerald-800/30",
                  "shadow-sm dark:shadow-none",
                  "hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]",
                  "transition-all duration-300",
                  "p-4 sm:p-6"
                )}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Timer content */}
                <div className="relative flex flex-col items-center space-y-6">
                  {/* Mode selector buttons */}
                  <div className="flex space-x-3">
                    <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant={isWorking ? "default" : "outline"}
                        onClick={() => handleModeChange(true)}
                        className={cn(
                          "w-20 sm:w-24 h-8 sm:h-9 font-medium relative overflow-hidden rounded-full",
                          isWorking 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            : "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
                          "transition-all duration-300"
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1.5 inline-block" />
                        Work
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                      <Button
                        variant={!isWorking ? "default" : "outline"}
                        onClick={() => handleModeChange(false)}
                        className={cn(
                          "w-20 sm:w-24 h-8 sm:h-9 font-medium relative overflow-hidden rounded-full",
                          !isWorking 
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                            : "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
                          "transition-all duration-300"
                        )}
                      >
                        <Coffee className="w-3 h-3 mr-1.5 inline-block" />
                        Break
                      </Button>
                    </motion.div>
                    
                    {/* Add Timer Settings */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "w-8 h-8 sm:w-9 sm:h-9 rounded-full",
                              "border-emerald-300 dark:border-emerald-800",
                              "text-emerald-700 dark:text-emerald-400",
                              "hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
                              "transition-all duration-300"
                            )}
                          >
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </motion.div>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Timer Settings</h4>
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex justify-between">
                                <label className="text-sm font-medium">Work Duration</label>
                                <span className="text-sm text-muted-foreground">{workDuration} min</span>
                              </div>
                              <Slider
                                min={1}
                                max={60}
                                step={1}
                                value={[workDuration]}
                                onValueChange={([value]) => {
                                  setWorkDuration(value)
                                  if (!isPlaying) {
                                    setTimeLeft(value * 60)
                                  }
                                }}
                                className="[&_[role=slider]]:bg-emerald-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between">
                                <label className="text-sm font-medium">Break Duration</label>
                                <span className="text-sm text-muted-foreground">{breakDuration} min</span>
                              </div>
                              <Slider
                                min={1}
                                max={30}
                                step={1}
                                value={[breakDuration]}
                                onValueChange={([value]) => {
                                  setBreakDuration(value)
                                  if (!isPlaying && !isWorking) {
                                    setTimeLeft(value * 60)
                                  }
                                }}
                                className="[&_[role=slider]]:bg-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Timer display */}
                  <div className="relative">
                    <svg className="w-52 h-52 sm:w-60 sm:h-60 -rotate-90 transform">
                      {/* Background track */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={CIRCLE_RADIUS}
                        className="stroke-emerald-100 dark:stroke-emerald-950/20"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50%"
                        cy="50%"
                        r={CIRCLE_RADIUS}
                        className="stroke-emerald-600 dark:stroke-emerald-400"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`}
                        strokeDashoffset={CIRCLE_CIRCUMFERENCE - progress}
                        style={{
                          transition: isPlaying ? "stroke-dashoffset 1s linear" : "none"
                        }}
                      />
                    </svg>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ 
                        scale: isPlaying ? [1, 1.02, 1] : 1,
                        opacity: isPlaying ? [1, 0.8, 1] : 1
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: isPlaying ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      <span className={cn(
                        "text-4xl sm:text-5xl font-bold tracking-tighter",
                        "bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500",
                        "bg-clip-text text-transparent",
                        "drop-shadow-sm"
                      )}>
                        {formatTime(timeLeft)}
                      </span>
                    </motion.div>
                  </div>
                  
                  {/* Control buttons */}
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-center space-x-2">
                      <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePlayPause}
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-full",
                            "border-emerald-300 dark:border-emerald-800",
                            "text-emerald-700 dark:text-emerald-400",
                            "hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
                            "transition-all duration-300"
                          )}
                        >
                          {isPlaying ? (
                            <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
                          )}
                        </Button>
                      </motion.div>
                      <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleReset}
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-full",
                            "border-emerald-300 dark:border-emerald-800",
                            "text-emerald-700 dark:text-emerald-400",
                            "hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
                            "transition-all duration-300"
                          )}
                        >
                          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent dark:from-emerald-400/5" />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-background/5" />
                </div>
              </motion.div>

              {/* Session Goals and Progress Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.div variants={cardVariants}>
                  <motion.div
                    className={cn(
                      cardStyles.base,
                      cardStyles.padding,
                      cardStyles.success,
                      cardStyles.hover,
                      cardStyles.gradient
                    )}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={cardStyles.innerCard}>
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400" />
                        <h3 className={textStyles.cardTitle}>Session Goals</h3>
                      </div>
                      <p className={textStyles.bodyText}>
                        Set and track your production goals for each session.
                      </p>
                      <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                        <Button 
                          className={buttonStyles.gradient}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Set New Goal
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <motion.div
                    className={cn(
                      cardStyles.base,
                      cardStyles.padding,
                      cardStyles.mediumPriority,
                      cardStyles.hover,
                      cardStyles.gradient
                    )}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={cardStyles.innerCard}>
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 dark:text-amber-400" />
                        <h3 className={textStyles.cardTitle}>Progress Tracking</h3>
                      </div>
                      <p className={textStyles.bodyText}>
                        Monitor your session progress and achievements.
                      </p>
                      <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                        <Button 
                          className={buttonStyles.outlineGradient}
                        >
                          <BarChart className="w-4 h-4 mr-2" />
                          View Progress
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Recent Projects */}
              <motion.div variants={cardVariants}>
                <motion.div
                  className={cn(
                    cardStyles.base,
                    cardStyles.padding,
                    cardStyles.success,
                    cardStyles.hover,
                    cardStyles.gradient,
                    "backdrop-blur-sm"
                  )}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={cardStyles.innerCard}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className={textStyles.cardTitle}>Recent Projects</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className={cn(
                          "text-xs",
                          "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                          "hover:text-emerald-600 dark:hover:text-emerald-400",
                          "transition-all duration-200"
                        )}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                          </div>
                        ) : mappedProjects.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No projects found. Start a new project to begin tracking your progress.
                          </div>
                        ) : (
                          mappedProjects.map((project) => (
                            <SessionCard
                              key={project.id}
                              track={{
                                ...project,
                                artist: project.artist || 'Unknown Artist',
                                genre: project.genre || 'Uncategorized',
                                created_at: project.created_at || 'Not Started',
                                last_modified: project.last_modified || project.created_at || 'Not Started'
                              }}
                              onComplete={handleCompleteProject}
                              onEdit={handleEditProject}
                              onPlay={handlePlayProject}
                              onPause={handlePauseProject}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* AI Coach sidebar */}
            <motion.div 
              className="lg:col-span-1"
              variants={cardVariants}
            >
              <div className="sticky top-4 lg:top-8">
                <AICoach tracks={mappedProjects || []} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default Sessions 
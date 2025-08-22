import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { logger } from '@/utils/logger'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Target, 
  TrendingUp, 
  Flame, 
  Clock,
  Plus,
  Check,
  X,
  Brain,
  Sparkles,
  Square,
  Volume2,
  Bell,
  Keyboard,
  Activity,
  Timer,
  BarChart3,
  Calendar,
  ChevronRight,
  ListTodo,
  Trophy,
  Zap,
  Coffee
} from 'lucide-react'

// Basic shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Custom hooks
import { useTimer } from '@/hooks/useTimer'
import { useGoals } from '@/hooks/useGoals'
import { useStats } from '@/hooks/useStats'
import { useKeyboardShortcuts, useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts'
import { Goal } from '@/utils/sessionUtils'

// AI-powered systems
import { SessionSuccessPredictor } from '@/lib/smart-session-optimizer'
import { AIGoalRecommendationEngine, GoalRiskAssessment } from '@/lib/ai-goal-system'

// Analytics components
import { WeeklyOverviewChart } from '@/components/sessions/WeeklyOverviewChart'

const Sessions = () => {
  const { toast } = useToast()
  
  // Custom hooks
  const timer = useTimer()
  const goals = useGoals()
  const stats = useStats()
  
  // UI State
  const [showSettings, setShowSettings] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [newGoalText, setNewGoalText] = useState('')
  const [selectedView, setSelectedView] = useState<'timer' | 'goals' | 'stats'>('timer')
  const [activeTab, setActiveTab] = useState('timer')
  
  // AI-powered state
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [sessionPrediction, setSessionPrediction] = useState<any>(null)
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [goalRiskAssessments, setGoalRiskAssessments] = useState<Map<string, any>>(new Map())
  
  // Refs
  const newGoalInputRef = useRef<HTMLInputElement>(null)
  
  // Get keyboard shortcuts help
  const keyboardHelp = useKeyboardShortcutsHelp()

  // Initialize AI systems
  const sessionPredictor = useRef(new SessionSuccessPredictor())
  const goalRecommendationEngine = useRef(new AIGoalRecommendationEngine())
  const goalRiskAssessment = useRef(new GoalRiskAssessment())
  
  // Debounced toast notifications
  const debouncedToast = useCallback(
    useDebouncedCallback((status: string, mode: string) => {
      if (status === 'completed') {
        const isWork = mode === 'focus'
        toast({
          title: isWork ? 'Focus session complete! 🎉' : 'Break time over! 💪',
          description: isWork ? 'Time for a well-deserved break' : 'Ready to focus again?',
        })
      }
    }, 500),
    [toast]
  )
  
  useEffect(() => {
    debouncedToast(timer.state.status, timer.state.mode)
  }, [timer.state.status, timer.state.mode, debouncedToast])

  // AI-powered session prediction and optimization
  useEffect(() => {
    const generateSessionPrediction = async () => {
      try {
        // Create mock prediction for demo since AI systems expect different data structure
        const mockPrediction = {
          successProbability: Math.min(0.9, 0.5 + (stats.currentStreak * 0.1) + (stats.todaysStats.completedSessions * 0.05)),
          recommendedDuration: timer.state.mode === 'focus' ? timer.state.settings.focusDuration : timer.state.settings.breakDuration,
          insights: stats.currentStreak > 3 
            ? "You're on a great streak! Perfect timing for a productive session." 
            : stats.currentStreak > 1 
            ? "Building momentum - keep up the consistency!" 
            : "Fresh start - perfect time to begin your focus journey.",
          confidenceLevel: stats.recentSessions.length > 5 ? 0.8 : 0.6
        }
        setSessionPrediction(mockPrediction)
      } catch (error) {
        console.log('Session prediction demo mode')
      }
    }

    generateSessionPrediction()
  }, [stats.recentSessions, stats.todaysStats, stats.currentStreak, timer.state.mode, timer.state.settings])

  // Generate AI goal suggestions
  useEffect(() => {
    const generateAiSuggestions = async () => {
      try {
        // Create mock suggestions for demo
        const mockSuggestions = [
          {
            id: 'ai-goal-1',
            title: goals.pendingGoals.length === 0 ? 'Complete 3 focus sessions today' : 'Extend current focus streak',
            reasoning: stats.currentStreak > 2 
              ? 'Your streak momentum suggests you can handle an increased challenge' 
              : 'Starting with achievable goals builds consistency',
            estimatedDuration: 25,
            confidenceScore: 75 + (stats.currentStreak * 5),
            priority: 'medium' as const,
            category: 'productivity'
          },
          {
            id: 'ai-goal-2',
            title: 'Practice deep work session',
            reasoning: 'Your session history shows readiness for longer focus periods',
            estimatedDuration: 45,
            confidenceScore: 65 + (stats.todaysStats.completedSessions * 10),
            priority: 'medium' as const,
            category: 'focus'
          },
          {
            id: 'ai-goal-3',
            title: 'Reflect on today\'s productivity',
            reasoning: 'Reflection helps maintain momentum and identify improvement areas',
            estimatedDuration: 10,
            confidenceScore: 90,
            priority: 'low' as const,
            category: 'reflection'
          }
        ]
        
        // Filter suggestions based on current state
        const relevantSuggestions = mockSuggestions.filter(s => {
          if (goals.pendingGoals.some(g => g.text.toLowerCase().includes(s.title.toLowerCase()))) {
            return false // Don't suggest duplicate goals
          }
          return true
        })

        setAiSuggestions(relevantSuggestions.slice(0, 3))
      } catch (error) {
        console.log('AI goal suggestions demo mode')
      }
    }

    generateAiSuggestions()
  }, [goals.pendingGoals, goals.completedGoals, stats.recentSessions, stats.currentStreak, stats.todaysStats.completedSessions])

  // Risk assessment for existing goals
  useEffect(() => {
    const assessGoalRisks = async () => {
      try {
        const newAssessments = new Map()
        
        for (const goal of goals.pendingGoals) {
          // Create mock risk assessment for demo
          const timeOfDay = new Date().getHours()
          const completionRate = goals.completedGoals.length / (goals.completedGoals.length + goals.pendingGoals.length) || 0.5
          
          let riskLevel = 'medium'
          let completionProbability = 0.6
          
          // Calculate based on various factors
          if (stats.currentStreak > 3 && timeOfDay >= 9 && timeOfDay <= 17) {
            riskLevel = 'low'
            completionProbability = 0.8 + (completionRate * 0.15)
          } else if (stats.currentStreak <= 1 || goal.estimatedMinutes > 60) {
            riskLevel = 'high'
            completionProbability = 0.3 + (completionRate * 0.2)
          } else {
            completionProbability = 0.6 + (stats.currentStreak * 0.05) + (completionRate * 0.1)
          }
          
          const assessment = {
            riskLevel,
            completionProbability: Math.min(0.95, Math.max(0.1, completionProbability)),
            factors: ['Time of day', 'Current streak', 'Goal complexity'],
            recommendations: riskLevel === 'high' 
              ? ['Consider breaking into smaller goals', 'Schedule during peak hours']
              : ['Good timing for this goal', 'Maintain current momentum']
          }
          
          newAssessments.set(goal.id, assessment)
        }
        
        setGoalRiskAssessments(newAssessments)
      } catch (error) {
        console.log('Goal risk assessment demo mode')
      }
    }

    if (goals.pendingGoals.length > 0) {
      assessGoalRisks()
    }
  }, [goals.pendingGoals, goals.completedGoals, stats.currentStreak])
  
  // Goal management
  const handleAddGoal = useCallback(async () => {
    if (!newGoalText.trim()) return
    
    const result = await goals.addGoal(newGoalText, 'medium', 25)
    
    if (result.success) {
      setNewGoalText('')
      toast({
        title: 'Goal added! 🎯',
        description: `"${newGoalText}" added to your focus list`,
      })
    }
  }, [newGoalText, goals, toast])
  
  const handleDeleteGoal = useCallback(async (id: string) => {
    const result = await goals.deleteGoal(id)
    
    if (result.success) {
      toast({
        title: 'Goal deleted',
        description: 'Goal has been removed from your list',
      })
    }
  }, [goals, toast])

  // Add AI suggested goal
  const handleAddAiSuggestion = useCallback(async (suggestion: any) => {
    const result = await goals.addGoal(suggestion.title, suggestion.priority, suggestion.estimatedDuration)
    
    if (result.success) {
      toast({
        title: '🤖 AI Goal Added!',
        description: `"${suggestion.title}" added with ${suggestion.confidenceScore}% confidence`,
      })
      // Remove from suggestions
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    }
  }, [goals, toast])
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    toggleTimer: timer.isActive ? timer.pause : timer.start,
    resetTimer: timer.reset,
    switchToFocus: () => timer.switchMode('focus'),
    switchToBreak: () => timer.switchMode('break'),
    addGoal: () => newGoalInputRef.current?.focus(),
    openSettings: () => setShowSettings(true),
    closeModal: () => {
      setShowSettings(false)
      setShowKeyboardHelp(false)
    }
  }, !showSettings && !showKeyboardHelp)

  return (
    <TooltipProvider>
      <div className="w-full">
        
        <main className="w-full">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Focus Sessions</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Focus Sessions</h1>
            <p className="text-muted-foreground">
              Use the Pomodoro Technique to boost your productivity
            </p>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
              <TabsTrigger value="timer" className="gap-2">
                <Timer className="h-4 w-4" />
                Timer
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <ListTodo className="h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Timer Tab */}
            <TabsContent value="timer" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Timer Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Focus Timer</CardTitle>
                      <div className="flex gap-2">
                        <Badge 
                          variant={timer.state.mode === 'focus' ? 'default' : 'secondary'}
                          className={timer.state.mode === 'focus' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200' 
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200'
                          }
                        >
                          {timer.state.mode === 'focus' ? 'Focus Mode' : 'Break Mode'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowSettings(true)}>
                              Timer Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowKeyboardHelp(true)}>
                              <Keyboard className="h-4 w-4 mr-2" />
                              Keyboard Shortcuts
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex justify-center gap-2">
                      <Button
                        variant={timer.state.mode === 'focus' ? 'default' : 'outline'}
                        onClick={() => timer.switchMode('focus')}
                        className={`gap-2 transition-all ${
                          timer.state.mode === 'focus' 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                            : 'hover:border-blue-500 hover:text-blue-600'
                        }`}
                      >
                        <Brain className="h-4 w-4" />
                        Focus
                      </Button>
                      <Button
                        variant={timer.state.mode === 'break' ? 'default' : 'outline'}
                        onClick={() => timer.switchMode('break')}
                        className={`gap-2 transition-all ${
                          timer.state.mode === 'break' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' 
                            : 'hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        <Coffee className="h-4 w-4" />
                        Break
                      </Button>
                    </div>

                    {/* Timer Display - Enhanced with Color */}
                    <div className="flex justify-center">
                      <div className={`text-7xl font-mono font-bold text-center mb-8 transition-colors ${
                        timer.state.mode === 'focus' 
                          ? 'text-blue-600 dark:text-blue-500'
                          : 'text-emerald-600 dark:text-emerald-500'
                      }`}>
                        {timer.formattedTime}
                      </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={timer.isActive ? timer.pause : timer.start}
                        size="lg"
                        className={`gap-2 min-w-[120px] transition-all ${
                          !timer.isActive 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {timer.isActive ? (
                          <>
                            <Pause className="h-5 w-5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            {timer.isPaused ? 'Resume' : 'Start'}
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={timer.reset}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      
                      <Button
                        onClick={timer.stop}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    </div>

                    {/* Session Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Session Progress</span>
                        <span className="font-medium">{Math.round(timer.progress)}%</span>
                      </div>
                      <Progress 
                        value={timer.progress} 
                        className={`h-3 [&>div]:transition-all ${
                          timer.state.mode === 'focus' 
                            ? '[&>div]:bg-blue-600' 
                            : '[&>div]:bg-emerald-600'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Today's Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-blue-600" />
                          Sessions
                        </span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{stats.todaysStats.completedSessions}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          Focus Time
                        </span>
                        <span className="font-bold text-purple-700 dark:text-purple-400">{Math.floor(stats.todaysStats.focusTime / 3600)}h</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-600" />
                          Streak
                        </span>
                        <span className="font-bold flex items-center gap-1 text-orange-700 dark:text-orange-400">
                          {stats.currentStreak}
                          <Zap className="h-4 w-4 text-orange-500" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Goals Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Focus Goals</CardTitle>
                    <CardDescription>
                      Set specific goals for your focus sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Add Goal Form */}
                      <div className="flex gap-2">
                        <Input
                          ref={newGoalInputRef}
                          value={newGoalText}
                          onChange={(e) => setNewGoalText(e.target.value)}
                          placeholder="What do you want to focus on?"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddGoal()
                            }
                          }}
                        />
                        <Button 
                          onClick={handleAddGoal}
                          disabled={!newGoalText.trim()}
                          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Plus className="h-4 w-4" />
                          Add Goal
                        </Button>
                      </div>

                      <Separator />

                      {/* Goals List */}
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {goals.pendingGoals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-800/30">
                              <Target className="h-12 w-12 text-indigo-600 mb-4" />
                              <p className="text-sm text-muted-foreground">
                                No active goals yet
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Add a goal above to get started
                              </p>
                            </div>
                          ) : (
                            goals.pendingGoals.map((goal) => {
                              const riskAssessment = goalRiskAssessments.get(goal.id)
                              return (
                                <Card key={goal.id} className="p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                  <div className="flex items-center gap-3">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-950/30"
                                      onClick={() => goals.toggleGoal(goal.id)}
                                    >
                                      <div className="h-4 w-4 rounded-full border-2 border-indigo-600" />
                                    </Button>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {goal.text}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                          Est. {goal.estimatedMinutes}m
                                        </p>
                                        {riskAssessment && (
                                          <Badge 
                                            variant={riskAssessment.riskLevel === 'low' ? 'default' : 
                                                   riskAssessment.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                                            className="text-xs"
                                          >
                                            {Math.round(riskAssessment.completionProbability * 100)}% success
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
                                      onClick={() => handleDeleteGoal(goal.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </Card>
                              )
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                {/* AI-Powered Insights */}
                <div className="space-y-6">
                  {/* Session Prediction */}
                  {sessionPrediction && (
                    <Card className="border-purple-200 dark:border-purple-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Brain className="h-4 w-4 text-purple-600" />
                          AI Session Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Success Probability</span>
                          <span className="font-bold text-purple-600">
                            {Math.round(sessionPrediction.successProbability * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={sessionPrediction.successProbability * 100} 
                          className="h-2 [&>div]:bg-purple-600"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Optimal Duration</span>
                          <span className="font-medium">{sessionPrediction.recommendedDuration}m</span>
                        </div>
                        {sessionPrediction.insights && (
                          <Alert className="border-purple-200 dark:border-purple-800">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-xs">
                              {sessionPrediction.insights}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Goal Suggestions */}
                  {aiSuggestions.length > 0 && (
                    <Card className="border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          AI Goal Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {aiSuggestions.map((suggestion) => (
                              <div 
                                key={suggestion.id} 
                                className="p-3 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/10 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{suggestion.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {suggestion.reasoning}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {suggestion.estimatedDuration}m
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {Math.round(suggestion.confidenceScore)}% confidence
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                                    onClick={() => handleAddAiSuggestion(suggestion)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6">
                {/* Weekly Overview - Radial Chart */}
                <WeeklyOverviewChart 
                  weeklyStats={stats.weeklyStats}
                  currentStreak={stats.currentStreak}
                  todaysFocusTime={stats.todaysStats.focusTime}
                />

                {/* Recent Sessions - Enhanced */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-violet-600" />
                          Recent Sessions
                        </CardTitle>
                        <CardDescription>
                          Your latest focus and break sessions with performance insights
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {stats.recentSessions.length} sessions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats.recentSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 py-12 border border-violet-200 dark:border-violet-800/30">
                        <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30 mb-4">
                          <Activity className="h-8 w-8 text-violet-600" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No sessions yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                          Start your first focus session to see your productivity analytics here
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4 border-violet-200 text-violet-600 hover:bg-violet-50"
                          onClick={() => setActiveTab('timer')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start First Session
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentSessions.slice(0, 8).map((session, index) => {
                          const sessionDate = new Date(session.endTime || session.startTime)
                          const durationMinutes = Math.round(session.duration / 60)
                          const isToday = sessionDate.toDateString() === new Date().toDateString()
                          const isYesterday = sessionDate.toDateString() === new Date(Date.now() - 86400000).toDateString()
                          
                          let dateDisplay = sessionDate.toLocaleDateString()
                          if (isToday) dateDisplay = 'Today'
                          else if (isYesterday) dateDisplay = 'Yesterday'
                          
                          return (
                            <div 
                              key={session.id} 
                              className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-violet-200 dark:hover:border-violet-800/50 hover:bg-violet-50/30 dark:hover:bg-violet-950/10 transition-all duration-200"
                            >
                              <div className="flex items-center gap-4">
                                {/* Session Type Icon */}
                                <div className={`p-2 rounded-full ${
                                  session.type === 'focus' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                                }`}>
                                  {session.type === 'focus' ? (
                                    <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <Coffee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  )}
                                </div>
                                
                                {/* Session Details */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {session.type === 'focus' ? 'Focus Session' : 'Break Time'}
                                    </span>
                                    {session.completed && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                                        <Check className="h-3 w-3 mr-1" />
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {durationMinutes}m
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {dateDisplay}
                                    </span>
                                    <span>
                                      {sessionDate.toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Performance Indicator */}
                              <div className="flex items-center gap-2">
                                {session.type === 'focus' && (
                                  <div className="text-right">
                                    <div className={`text-xs font-medium ${
                                      durationMinutes >= 25 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : durationMinutes >= 15 
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      {durationMinutes >= 25 ? 'Excellent' : durationMinutes >= 15 ? 'Good' : 'Short'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {durationMinutes >= 25 ? '🔥' : durationMinutes >= 15 ? '👍' : '💡'}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Session Position Indicator */}
                                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {index + 1}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* View More Button */}
                        {stats.recentSessions.length > 8 && (
                          <div className="pt-4 border-t border-border/50">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                            >
                              View All {stats.recentSessions.length} Sessions
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Settings Dialog */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
                <DialogDescription>
                  Configure your focus and break durations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Focus Duration: {timer.state.settings.focusDuration}m</Label>
                  <Slider
                    value={[timer.state.settings.focusDuration]}
                    onValueChange={([value]) => timer.setFocusDuration(value)}
                    min={15}
                    max={120}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Break Duration: {timer.state.settings.breakDuration}m</Label>
                  <Slider
                    value={[timer.state.settings.breakDuration]}
                    onValueChange={([value]) => timer.setBreakDuration(value)}
                    min={5}
                    max={60}
                    step={5}
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications</Label>
                    <Switch
                      id="notifications"
                      checked={timer.state.settings.notificationsEnabled}
                      onCheckedChange={(checked) => 
                        timer.updateSettings({ notificationsEnabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound">Sound</Label>
                    <Switch
                      id="sound"
                      checked={timer.state.settings.soundEnabled}
                      onCheckedChange={(checked) => 
                        timer.updateSettings({ soundEnabled: checked })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettings(false)}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Keyboard Help Dialog */}
          <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                <DialogDescription>
                  Boost your productivity with these shortcuts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {keyboardHelp.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </main>
        
      </div>
    </TooltipProvider>
  )
}

export default Sessions
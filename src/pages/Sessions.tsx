import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import OptimizedTimerDisplay from '@/components/ui/optimized-timer'
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
  Lightbulb,
  Square,
  Edit3,
  Trash2,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Keyboard,
  Save,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTimer } from '@/hooks/useTimer'
import { useGoals } from '@/hooks/useGoals'
import { useStats } from '@/hooks/useStats'
import { useKeyboardShortcuts, useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts'
import { Goal, getPriorityColor, TimerSettings } from '@/utils/sessionUtils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface EditingGoal {
  id: string
  text: string
  priority: Goal['priority']
  estimatedMinutes: number
}

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
  const [editingGoal, setEditingGoal] = useState<EditingGoal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  
  // Refs
  const newGoalInputRef = useRef<HTMLInputElement>(null)
  const editGoalInputRef = useRef<HTMLInputElement>(null)
  
  // Get keyboard shortcuts help
  const keyboardHelp = useKeyboardShortcutsHelp()
  
  // Debounced toast notifications to prevent spam
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
  
  // Focus input when starting to edit
  useEffect(() => {
    if (editingGoal && editGoalInputRef.current) {
      editGoalInputRef.current.focus()
      editGoalInputRef.current.select()
    }
  }, [editingGoal])
  
  // Memoized goal management functions to prevent re-renders
  const handleAddGoal = useCallback(async () => {
    if (!newGoalText.trim()) return
    
    logger.performance('Adding goal', newGoalText)
    // Use simple defaults: medium priority, 25 minutes
    const result = await goals.addGoal(newGoalText, 'medium', 25)
    
    if (result.success) {
      setNewGoalText('')
      toast({
        title: 'Goal added! 🎯',
        description: `"${newGoalText}" added to your focus list`,
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add goal',
        variant: 'destructive'
      })
    }
  }, [newGoalText, goals, toast])
  
  const handleEditGoal = useCallback((goal: Goal) => {
    setEditingGoal({
      id: goal.id,
      text: goal.text,
      priority: goal.priority,
      estimatedMinutes: goal.estimatedMinutes
    })
  }, [])
  
  const handleSaveEdit = useCallback(async () => {
    if (!editingGoal) return
    
    const result = await goals.updateGoal(editingGoal.id, {
      text: editingGoal.text,
      priority: editingGoal.priority,
      estimatedMinutes: editingGoal.estimatedMinutes
    })
    
    if (result.success) {
      setEditingGoal(null)
      toast({
        title: 'Goal updated! ✏️',
        description: 'Goal has been successfully updated',
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update goal',
        variant: 'destructive'
      })
    }
  }, [editingGoal, goals, toast])
  
  const handleCancelEdit = useCallback(() => {
    setEditingGoal(null)
  }, [])
  
  const handleDeleteGoal = useCallback(async (id: string) => {
    const result = await goals.deleteGoal(id)
    
    if (result.success) {
      setGoalToDelete(null)
      toast({
        title: 'Goal deleted',
        description: 'Goal has been removed from your list',
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete goal',
        variant: 'destructive'
      })
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
      setEditingGoal(null)
      setGoalToDelete(null)
    }
  }, !showSettings && !showKeyboardHelp && !editingGoal)
  
  // Handle Enter key for adding goals
  const handleNewGoalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddGoal()
    }
  }, [handleAddGoal])
  
  // Handle Enter key for editing goals
  const handleEditGoalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit()
    }
  }, [handleSaveEdit, handleCancelEdit])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 pt-20 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent mb-4">
              Focus Sessions
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay focused and productive with focused work sessions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timer Section */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Modern Timer Card */}
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-xl">
                <CardContent className="p-8">
                  {/* Modern Mode Toggle */}
                  <div className="flex justify-center mb-8">
                    <div className="flex bg-black/10 dark:bg-black/30 rounded-full p-1 backdrop-blur-sm">
                      <button
                        onClick={() => timer.switchMode('focus')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          timer.state.mode === 'focus'
                            ? 'bg-emerald-600 text-white shadow-lg scale-105'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => timer.switchMode('break')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          timer.state.mode === 'break'
                            ? 'bg-purple-600 text-white shadow-lg scale-105'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Break
                      </button>
                    </div>
                  </div>

                  {/* Timer Display */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <OptimizedTimerDisplay
                        progress={timer.progress}
                        formattedTime={timer.formattedTime}
                        mode={timer.state.mode}
                        status={timer.state.status}
                        size={240}
                      />
                      {/* Status Indicator */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          timer.state.status === 'running' 
                            ? timer.state.mode === 'focus' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          {timer.state.status === 'running' ? timer.state.mode === 'focus' ? 'Focus Time' : 'Break Time' : 'Ready'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Controls */}
                  <div className="flex justify-center items-center space-x-3 mb-8">
                    <Button
                      onClick={timer.isActive ? timer.pause : timer.start}
                      size="lg"
                      className={`px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                        timer.state.mode === 'focus' 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {timer.isActive ? (
                        <Pause className="w-5 h-5 mr-2" />
                      ) : (
                        <Play className="w-5 h-5 mr-2" />
                      )}
                      {timer.isActive ? 'Pause' : timer.isPaused ? 'Resume' : 'Start'}
                    </Button>
                    
                    <Button
                      onClick={timer.reset}
                      variant="ghost"
                      size="lg"
                      className="p-3 rounded-full hover:bg-muted/50 transition-all duration-200"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      onClick={timer.stop}
                      variant="ghost"
                      size="lg"
                      className="p-3 rounded-full hover:bg-muted/50 transition-all duration-200"
                    >
                      <Square className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Compact Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="p-3 rounded-xl bg-black/5 dark:bg-black/25 backdrop-blur-sm">
                      <div className="text-lg font-bold text-foreground">
                        #{timer.state.completedSessions + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/5 dark:bg-black/25 backdrop-blur-sm">
                      <div className="text-lg font-bold text-foreground">
                        {stats.todaysStats.completedSessions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Today
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/5 dark:bg-black/25 backdrop-blur-sm">
                      <div className="text-lg font-bold text-foreground">
                        {Math.floor(stats.todaysStats.focusTime / 3600)}h {Math.floor((stats.todaysStats.focusTime % 3600) / 60)}m
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Focus Time
                      </div>
                    </div>
                  </div>

                  {/* Settings and Shortcuts */}
                  <div className="flex justify-center space-x-3">
                    <Dialog open={showSettings} onOpenChange={setShowSettings}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs px-3 py-2 rounded-full hover:bg-black/10 dark:hover:bg-black/30 transition-all duration-200">
                          <Settings className="w-3 h-3 mr-1" />
                          Settings
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Timer Settings
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 p-4">
                          {/* Duration Settings */}
                          <div className="space-y-4">
                            <h4 className="font-semibold">Duration Settings</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  Focus Duration
                                </Label>
                                <Badge variant="secondary">{timer.state.settings.focusDuration} min</Badge>
                              </div>
                              <Slider
                                value={[timer.state.settings.focusDuration]}
                                onValueChange={([value]) => timer.setFocusDuration(value)}
                                min={15}
                                max={120}
                                step={5}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                  Break Duration
                                </Label>
                                <Badge variant="secondary">{timer.state.settings.breakDuration} min</Badge>
                              </div>
                              <Slider
                                value={[timer.state.settings.breakDuration]}
                                onValueChange={([value]) => timer.setBreakDuration(value)}
                                min={5}
                                max={60}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Notification Settings */}
                          <div className="space-y-4">
                            <h4 className="font-semibold">Notifications</h4>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Bell className="w-4 h-4" />
                                <Label>Browser Notifications</Label>
                              </div>
                              <Switch 
                                checked={timer.state.settings.notificationsEnabled}
                                onCheckedChange={(checked) => timer.updateSettings({ notificationsEnabled: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Volume2 className="w-4 h-4" />
                                <Label>Sound Alerts</Label>
                              </div>
                              <Switch 
                                checked={timer.state.settings.soundEnabled}
                                onCheckedChange={(checked) => timer.updateSettings({ soundEnabled: checked })}
                              />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Auto-start Settings */}
                          <div className="space-y-4">
                            <h4 className="font-semibold">Auto-start</h4>
                            <div className="flex items-center justify-between">
                              <Label>Auto-start breaks</Label>
                              <Switch 
                                checked={timer.state.settings.autoStartBreaks}
                                onCheckedChange={(checked) => timer.updateSettings({ autoStartBreaks: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label>Auto-start focus sessions</Label>
                              <Switch 
                                checked={timer.state.settings.autoStartFocus}
                                onCheckedChange={(checked) => timer.updateSettings({ autoStartFocus: checked })}
                              />
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs px-3 py-2 rounded-full hover:bg-black/10 dark:hover:bg-black/30 transition-all duration-200">
                          <Keyboard className="w-3 h-3 mr-1" />
                          Shortcuts
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Keyboard className="w-5 h-5" />
                            Keyboard Shortcuts
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 p-4">
                          {keyboardHelp.map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{shortcut.description}</span>
                              <Badge variant="outline" className="font-mono">
                                {shortcut.key}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card className="border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    {stats.isLoading ? (
                      <div className="text-center py-3 text-muted-foreground">
                        <Clock className="h-5 w-5 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">Loading...</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {/* Show last 2 sessions */}
                        {stats.totalSessions === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No sessions yet</p>
                          </div>
                        ) : (
                          Array.from({ length: Math.min(2, stats.totalSessions) }, (_, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-md bg-black/5 dark:bg-black/25"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <div>
                                  <p className="text-xs font-medium">Focus Session</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">25m</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              
              {/* Enhanced Progress Overview */}
              <Card className="border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <CardTitle className="text-base font-semibold">
                      Today's Progress
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/30 dark:border-emerald-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Focus Time</span>
                      </div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.isLoading ? '...' : `${Math.floor(stats.todaysStats.focusTime / 3600)}h ${Math.floor((stats.todaysStats.focusTime % 3600) / 60)}m`}
                      </div>
                      <div className="text-xs text-emerald-600/70 dark:text-emerald-300/70 mt-1">
                        {stats.todaysStats.completedSessions} sessions
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50/80 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200/30 dark:border-orange-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Streak</span>
                      </div>
                      <div className="text-xl font-bold text-orange-500 dark:text-orange-400">
                        {stats.isLoading ? '...' : `${stats.currentStreak}`}
                      </div>
                      <div className="text-xs text-orange-600/70 dark:text-orange-300/70 mt-1">
                        {stats.currentStreak === 1 ? 'day' : 'days'} strong
                      </div>
                    </div>
                  </div>

                  {/* Goal Progress with Visual Enhancement */}
                  {goals.goals.length > 0 && (
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/15 border border-blue-200/20 dark:border-blue-800/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Goal Progress</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {Math.round(goals.completionRate)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="h-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${goals.completionRate}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-blue-600/70 dark:text-blue-300/70">
                            {goals.completedGoals.length} completed
                          </span>
                          <span className="text-xs text-blue-600/70 dark:text-blue-300/70">
                            {goals.goals.length - goals.completedGoals.length} remaining
                          </span>
                        </div>
                      </div>
                      
                      {goals.completionRate === 100 && (
                        <div className="text-center pt-2">
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            🎉 All goals achieved!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Goals */}
              <Card className="border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <CardTitle className="text-base font-semibold">
                        Focus Goals
                      </CardTitle>
                    </div>
                    {goals.goals.length > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">
                          {Math.round(goals.completionRate)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {goals.completedGoals.length}/{goals.goals.length} done
                        </div>
                      </div>
                    )}
                  </div>
                  {goals.goals.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {goals.completedGoals.length} of {goals.goals.length} completed
                        </span>
                      </div>
                      <div className="relative h-2 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${goals.completionRate}%` }}
                        />
                      </div>
                      {goals.completionRate === 100 && (
                        <div className="mt-1 text-center">
                          <span className="text-xs text-emerald-600 font-medium">🎉 All goals completed!</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Simplified Add Goal Form */}
                  <div className="relative">
                    <Input
                      ref={newGoalInputRef}
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      placeholder="What do you want to focus on?"
                      onKeyDown={handleNewGoalKeyDown}
                      className="pr-12 border-0 bg-black/5 dark:bg-black/25 focus:bg-black/10 dark:focus:bg-black/30 transition-colors"
                      disabled={goals.isLoading}
                    />
                    <Button 
                      onClick={handleAddGoal} 
                      disabled={!newGoalText.trim() || goals.isLoading}
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Clean Goals List */}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {goals.isLoading ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <div className="animate-pulse space-y-2">
                          <div className="h-10 bg-black/10 dark:bg-black/30 rounded"></div>
                          <div className="h-10 bg-black/5 dark:bg-black/25 rounded"></div>
                        </div>
                      </div>
                    ) : goals.goals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium mb-1">No goals yet</p>
                        <p className="text-xs opacity-75">Add a goal above to get started</p>
                      </div>
                    ) : (
                      <>
                        {goals.goals.map((goal) => (
                          <div
                            key={goal.id}
                            className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-sm ${
                              goal.completed 
                                ? 'bg-black/5 dark:bg-black/20 opacity-60' 
                                : 'bg-black/3 dark:bg-black/15 hover:bg-black/8 dark:hover:bg-black/25'
                            }`}
                          >
                            <button
                              onClick={() => goals.toggleGoal(goal.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                goal.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                                  : 'border-muted-foreground/40 hover:border-emerald-500 hover:scale-110'
                              }`}
                            >
                              {goal.completed && <Check className="w-3 h-3" />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}>
                                {goal.text}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 transition-all duration-200"
                            >
                              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Simple Clear Completed */}
                        {goals.completedGoals.length > 0 && (
                          <button
                            onClick={goals.clearCompleted}
                            className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-dashed border-muted/30 pt-3"
                            disabled={goals.isLoading}
                          >
                            Clear completed ({goals.completedGoals.length})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Coach */}
              <Alert className="border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertDescription className="mt-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 dark:text-blue-100">AI Focus Coach</span>
                    </div>
                    
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                          <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                            {timer.state.mode === 'focus' 
                              ? goals.pendingGoals.length > 0
                                ? `Focus on "${goals.pendingGoals[0].text}" for maximum productivity.`
                                : "Focus on one task at a time for maximum productivity."
                              : "Take a proper break! Step away from your screen and relax."
                            }
                          </p>
                          {stats.todaysStats.completedSessions > 0 && (
                            <p className="text-xs text-blue-600 dark:text-blue-300">
                              🎉 Great job! You've completed {stats.todaysStats.completedSessions} focus session{stats.todaysStats.completedSessions !== 1 ? 's' : ''} today.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-blue-600 dark:text-blue-300 text-center">
                      💡 Press <kbd className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">Space</kbd> to start/pause timer
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!goalToDelete} onOpenChange={() => setGoalToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setGoalToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => goalToDelete && handleDeleteGoal(goalToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

export default Sessions
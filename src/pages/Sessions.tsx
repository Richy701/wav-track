import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebouncedCallback } from 'use-debounce'
import OptimizedTimerDisplay from '@/components/ui/optimized-timer'
import VirtualizedGoals from '@/components/ui/virtualized-goals'
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
  const [newGoalPriority, setNewGoalPriority] = useState<Goal['priority']>('medium')
  const [newGoalEstimate, setNewGoalEstimate] = useState(25)
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
    const result = await goals.addGoal(newGoalText, newGoalPriority, newGoalEstimate)
    
    if (result.success) {
      setNewGoalText('')
      setNewGoalPriority('medium')
      setNewGoalEstimate(25)
      toast({
        title: 'Goal added! 🎯',
        description: `Added "${newGoalText}" to your goals`,
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add goal',
        variant: 'destructive'
      })
    }
  }, [newGoalText, newGoalPriority, newGoalEstimate])
  
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
              
              {/* Modern Progress Overview */}
              <Card className="border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <CardTitle className="text-base font-semibold">
                      Progress
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Goal Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Goals</span>
                      <span className="text-xs text-muted-foreground">
                        {goals.completedGoals.length}/{goals.goals.length}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-2 bg-black/10 dark:bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${goals.completionRate}%` }}
                        />
                      </div>
                      {goals.goals.length > 0 && (
                        <span className="absolute -top-5 right-0 text-xs font-medium text-emerald-600">
                          {goals.completionRate.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Compact Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10 border border-emerald-200/20 dark:border-emerald-800/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Focus</span>
                      </div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.isLoading ? '...' : `${Math.floor(stats.todaysStats.focusTime / 3600)}h ${Math.floor((stats.todaysStats.focusTime % 3600) / 60)}m`}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200/20 dark:border-orange-800/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Streak</span>
                      </div>
                      <div className="text-lg font-bold text-orange-500 dark:text-orange-400">
                        {stats.isLoading ? '...' : `${stats.currentStreak} days`}
                      </div>
                    </div>
                  </div>
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
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      {goals.completedGoals.length}/{goals.goals.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Modern Add Goal Form */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        ref={newGoalInputRef}
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder="Add a focus goal..."
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
                    
                    {/* Compact Priority & Duration */}
                    <div className="flex space-x-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-muted-foreground">Priority:</span>
                        <button
                          onClick={() => setNewGoalPriority('low')}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            newGoalPriority === 'low' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Low
                        </button>
                        <button
                          onClick={() => setNewGoalPriority('medium')}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            newGoalPriority === 'medium' 
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Med
                        </button>
                        <button
                          onClick={() => setNewGoalPriority('high')}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            newGoalPriority === 'high' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          High
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-muted-foreground">Time:</span>
                        <button
                          onClick={() => setNewGoalEstimate(25)}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            newGoalEstimate === 25 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          25m
                        </button>
                        <button
                          onClick={() => setNewGoalEstimate(45)}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            newGoalEstimate === 45 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          45m
                        </button>
                        <button
                          onClick={() => setNewGoalEstimate(60)}
                          className={`px-2 py-1 rounded-md transition-colors ${
                            newGoalEstimate === 60 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          60m
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modern Goals List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {goals.isLoading ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <div className="animate-pulse space-y-2">
                          <div className="h-8 bg-black/10 dark:bg-black/30 rounded"></div>
                          <div className="h-8 bg-black/5 dark:bg-black/25 rounded"></div>
                        </div>
                      </div>
                    ) : goals.goals.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Target className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Add your first goal above</p>
                      </div>
                    ) : (
                      <>
                        {goals.goals.slice(0, 6).map((goal) => (
                          <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                              goal.completed 
                                ? 'bg-black/5 dark:bg-black/20 border-zinc-200/20 dark:border-zinc-800/20 opacity-60' 
                                : 'bg-black/3 dark:bg-black/15 border-zinc-200/15 dark:border-zinc-800/15 hover:border-zinc-200/25 dark:hover:border-zinc-800/25'
                            }`}
                          >
                            <button
                              onClick={() => goals.toggleGoal(goal.id)}
                              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                goal.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-muted-foreground/30 hover:border-emerald-500'
                              }`}
                            >
                              {goal.completed && <Check className="w-2.5 h-2.5" />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${
                                goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}>
                                {goal.text}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  goal.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                  {goal.priority}
                                </span>
                                <span className="text-xs text-muted-foreground">{goal.estimatedMinutes}m</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all duration-200"
                            >
                              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </motion.div>
                        ))}
                        
                        {/* Clear Completed */}
                        {goals.completedGoals.length > 0 && (
                          <button
                            onClick={goals.clearCompleted}
                            className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-dashed border-muted/30 pt-3"
                            disabled={goals.isLoading}
                          >
                            Clear {goals.completedGoals.length} completed
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
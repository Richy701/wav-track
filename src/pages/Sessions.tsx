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
  Save
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent mb-4">
              Focus Sessions
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay focused and productive with focused work sessions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Timer Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Timer Card */}
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pomodoro Timer
                  </CardTitle>
                  <CardDescription>
                    Stay focused with timed work sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {/* Mode Toggle using Tabs */}
                  <div className="flex justify-center mb-8">
                    <Tabs value={timer.state.mode} onValueChange={(value) => timer.switchMode(value as 'focus' | 'break')} className="w-fit">
                      <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="focus" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                          Focus
                        </TabsTrigger>
                        <TabsTrigger value="break" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                          Break
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Optimized Timer Display */}
                  <div className="text-center mb-8">
                    <OptimizedTimerDisplay
                      progress={timer.progress}
                      formattedTime={timer.formattedTime}
                      mode={timer.state.mode}
                      status={timer.state.status}
                      size={256}
                    />
                  </div>

                  {/* Timer Controls */}
                  <div className="flex justify-center space-x-4 mb-6">
                    <Button
                      onClick={timer.isActive ? timer.pause : timer.start}
                      size="lg"
                      className={`px-8 shadow-lg hover:shadow-xl transition-all duration-200 ${
                        timer.state.mode === 'focus' 
                          ? 'bg-purple-600 hover:bg-purple-700 hover:scale-105' 
                          : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105'
                      }`}
                    >
                      {timer.isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {timer.isActive ? 'Pause' : timer.isPaused ? 'Resume' : 'Start'}
                    </Button>
                    <Button
                      onClick={timer.reset}
                      variant="outline"
                      size="lg"
                      className="hover:scale-105 transition-all duration-200"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={timer.stop}
                      variant="outline"
                      size="lg"
                      className="hover:scale-105 transition-all duration-200"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  </div>

                  {/* Session Info */}
                  <div className="flex justify-center space-x-8 text-center">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="mb-2 text-xs">
                        Current Session
                      </Badge>
                      <div className="text-2xl font-bold text-foreground">
                        #{timer.state.completedSessions + 1}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-16" />
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="mb-2 text-xs">
                        Completed Today
                      </Badge>
                      <div className="text-2xl font-bold text-foreground">
                        {stats.todaysStats.completedSessions}
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-16" />
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="mb-2 text-xs">
                        Focus Time
                      </Badge>
                      <div className="text-2xl font-bold text-foreground">
                        {Math.floor(stats.todaysStats.focusTime / 3600)}h {Math.floor((stats.todaysStats.focusTime % 3600) / 60)}m
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings and Help Buttons */}
              <div className="flex justify-center space-x-4">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="hover:scale-105 transition-all duration-200">
                      <Settings className="w-4 h-4 mr-2" />
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
                    <Button variant="outline" className="hover:scale-105 transition-all duration-200">
                      <Keyboard className="w-4 h-4 mr-2" />
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Stats */}
              <Card className="border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Goals Completed</span>
                    <Badge variant="outline" className="font-semibold">
                      {goals.completedGoals.length}/{goals.goals.length}
                    </Badge>
                  </div>
                  <Progress 
                    value={goals.completionRate} 
                    className="h-3 bg-muted/50" 
                  />
                  
                  {goals.goals.length > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      {goals.completionRate.toFixed(0)}% complete
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.isLoading ? '...' : `${Math.floor(stats.todaysStats.focusTime / 3600)}h ${Math.floor((stats.todaysStats.focusTime % 3600) / 60)}m`}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Focus</div>
                    </Card>
                    <Card className="p-4 text-center border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                      <div className="text-2xl font-bold text-orange-500 flex items-center justify-center">
                        <Flame className="w-5 h-5 mr-1" />
                        {stats.isLoading ? '...' : stats.currentStreak}
                      </div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Goals */}
              <Card className="border-0 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="w-5 h-5 text-emerald-600" />
                      Focus Goals
                    </CardTitle>
                    <Badge variant="outline" className="font-semibold">
                      {goals.completedGoals.length}/{goals.goals.length}
                    </Badge>
                  </div>
                  <CardDescription>
                    Set and track your focus session goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Goal */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-muted/30">
                    <Input
                      ref={newGoalInputRef}
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      placeholder="What do you want to accomplish?"
                      onKeyDown={handleNewGoalKeyDown}
                      className="border-muted/50 focus:border-purple-500"
                      disabled={goals.isLoading}
                    />
                    <div className="flex space-x-2">
                      <Select 
                        value={newGoalPriority} 
                        onValueChange={(value) => setNewGoalPriority(value as Goal['priority'])}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={newGoalEstimate.toString()} 
                        onValueChange={(value) => setNewGoalEstimate(parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15m</SelectItem>
                          <SelectItem value="25">25m</SelectItem>
                          <SelectItem value="30">30m</SelectItem>
                          <SelectItem value="45">45m</SelectItem>
                          <SelectItem value="60">60m</SelectItem>
                          <SelectItem value="90">90m</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddGoal} 
                        disabled={!newGoalText.trim() || goals.isLoading}
                        className="hover:scale-105 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Optimized Goals List with Virtualization */}
                  <div className="max-h-80">
                    {goals.isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading goals...
                      </div>
                    ) : goals.goals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No goals yet. Add your first goal above!</p>
                      </div>
                    ) : (
                      <VirtualizedGoals
                        goals={goals.goals}
                        editingGoal={editingGoal}
                        onToggleGoal={goals.toggleGoal}
                        onEditGoal={handleEditGoal}
                        onDeleteGoal={handleDeleteGoal}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        setEditingGoal={setEditingGoal}
                        setGoalToDelete={setGoalToDelete}
                        isLoading={goals.isLoading}
                        height={320}
                      />
                    )}
                  </div>
                  
                  {/* Clear Completed Button */}
                  {goals.completedGoals.length > 0 && (
                    <div className="pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goals.clearCompleted}
                        className="w-full text-xs"
                        disabled={goals.isLoading}
                      >
                        Clear {goals.completedGoals.length} completed goal{goals.completedGoals.length > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
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
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
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SessionsWorking = () => {
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
  
  // Refs
  const newGoalInputRef = useRef<HTMLInputElement>(null)
  
  // Get keyboard shortcuts help
  const keyboardHelp = useKeyboardShortcutsHelp()
  
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main className="container mx-auto pt-24 pb-16 px-4 md:px-6">
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
          <Tabs defaultValue="timer" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
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
                        <Badge variant={timer.state.mode === 'focus' ? 'default' : 'secondary'}>
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
                        className="gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        Focus
                      </Button>
                      <Button
                        variant={timer.state.mode === 'break' ? 'default' : 'outline'}
                        onClick={() => timer.switchMode('break')}
                        className="gap-2"
                      >
                        <Coffee className="h-4 w-4" />
                        Break
                      </Button>
                    </div>

                    {/* Timer Display - Simple Version */}
                    <div className="flex justify-center">
                      <div className="text-6xl font-mono font-bold text-center mb-8">
                        {timer.formattedTime}
                      </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex justify-center gap-2">
                      <Button
                        onClick={timer.isActive ? timer.pause : timer.start}
                        size="lg"
                        className="gap-2 min-w-[120px]"
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
                      <Progress value={timer.progress} className="h-3" />
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sessions</span>
                        <span className="font-bold">{stats.todaysStats.completedSessions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Focus Time</span>
                        <span className="font-bold">{Math.floor(stats.todaysStats.focusTime / 3600)}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Streak</span>
                        <span className="font-bold flex items-center gap-1">
                          {stats.currentStreak}
                          <Flame className="h-4 w-4 text-orange-500" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-6">
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
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Goal
                      </Button>
                    </div>

                    <Separator />

                    {/* Goals List */}
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {goals.pendingGoals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Target className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">
                              No active goals yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Add a goal above to get started
                            </p>
                          </div>
                        ) : (
                          goals.pendingGoals.map((goal) => (
                            <Card key={goal.id} className="p-3">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => goals.toggleGoal(goal.id)}
                                >
                                  <div className="h-4 w-4 rounded-full border-2 border-primary" />
                                </Button>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {goal.text}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Est. {goal.estimatedMinutes}m
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteGoal(goal.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6">
                {/* Weekly Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Overview</CardTitle>
                    <CardDescription>
                      Your productivity over the past 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-7 gap-2">
                        {stats.weeklyStats.map((day, i) => {
                          const hasActivity = day.focusTime > 0
                          const intensity = hasActivity ? Math.min(day.focusTime / 3600, 4) / 4 : 0
                          return (
                            <div key={i} className="text-center">
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                              </p>
                              <div 
                                className="h-20 rounded bg-muted flex items-end justify-center p-1"
                              >
                                <div 
                                  className="w-full bg-primary rounded transition-all"
                                  style={{ 
                                    height: `${intensity * 100}%`,
                                    minHeight: hasActivity ? '8px' : '0px'
                                  }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.round(day.focusTime / 3600)}h
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                      Your latest focus and break sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentSessions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No sessions yet</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          stats.recentSessions.slice(0, 10).map((session) => {
                            const sessionDate = new Date(session.endTime || session.startTime)
                            return (
                              <TableRow key={session.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {session.type === 'focus' ? (
                                      <Badge variant="default" className="gap-1">
                                        <Brain className="h-3 w-3" />
                                        Focus
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="gap-1">
                                        <Coffee className="h-3 w-3" />
                                        Break
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{Math.round(session.duration / 60)}m</TableCell>
                                <TableCell>
                                  {sessionDate.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </TableCell>
                                <TableCell>
                                  {sessionDate.toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
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
        
        <Footer />
      </div>
    </TooltipProvider>
  )
}

export default SessionsWorking
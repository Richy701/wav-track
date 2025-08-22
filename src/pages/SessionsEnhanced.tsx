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
  Coffee,
  Command,
  Music,
  Headphones,
  Award,
  ChevronDown,
  Star,
  ArrowRight,
  Rocket,
  Filter,
  Search,
  Moon,
  Sun,
  MoreVertical,
  Grid3x3
} from 'lucide-react'

// Core shadcn/ui Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Advanced shadcn/ui Components
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { 
  Command as CommandComponent, 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator 
} from '@/components/ui/command'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { AspectRatio } from '@/components/ui/aspect-ratio'

// Animation and UI utility imports
import { cn } from '@/lib/utils'

// Custom hooks
import { useTimer } from '@/hooks/useTimer'
import { useGoals } from '@/hooks/useGoals'
import { useStats } from '@/hooks/useStats'
import { useKeyboardShortcuts, useKeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts'
import { Goal } from '@/utils/sessionUtils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TimerDisplay from '@/components/timer/TimerDisplay'

// Session Templates
const sessionTemplates = [
  { id: 1, name: 'Deep Focus', duration: 90, break: 15, icon: Brain, color: 'from-purple-500 to-pink-500' },
  { id: 2, name: 'Quick Sprint', duration: 25, break: 5, icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { id: 3, name: 'Creative Flow', duration: 45, break: 10, icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
  { id: 4, name: 'Marathon', duration: 120, break: 20, icon: Rocket, color: 'from-green-500 to-emerald-500' },
  { id: 5, name: 'Pomodoro', duration: 25, break: 5, icon: Timer, color: 'from-red-500 to-rose-500' },
]

// Quick Actions for Command Palette
const quickActions = [
  { id: 'start', label: 'Start Timer', icon: Play, shortcut: 'Space' },
  { id: 'pause', label: 'Pause Timer', icon: Pause, shortcut: 'Space' },
  { id: 'reset', label: 'Reset Timer', icon: RotateCcw, shortcut: 'R' },
  { id: 'add-goal', label: 'Add New Goal', icon: Plus, shortcut: 'G' },
  { id: 'toggle-sound', label: 'Toggle Sound', icon: Volume2, shortcut: 'S' },
  { id: 'settings', label: 'Open Settings', icon: Settings, shortcut: ',' },
]

const SessionsEnhanced = () => {
  const { toast } = useToast()
  
  // Custom hooks
  const timer = useTimer()
  const goals = useGoals()
  const stats = useStats()
  
  // UI State
  const [commandOpen, setCommandOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newGoalText, setNewGoalText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  
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
  
  // Handle template selection
  const handleTemplateSelect = (template: typeof sessionTemplates[0]) => {
    timer.setFocusDuration(template.duration)
    timer.setBreakDuration(template.break)
    setSelectedTemplate(template.id)
    toast({
      title: `${template.name} Template Applied`,
      description: `${template.duration}min focus, ${template.break}min break`,
    })
  }
  
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
  
  // Command palette actions
  const handleCommand = (action: string) => {
    switch (action) {
      case 'start':
      case 'pause':
        timer.isActive ? timer.pause() : timer.start()
        break
      case 'reset':
        timer.reset()
        break
      case 'add-goal':
        newGoalInputRef.current?.focus()
        break
      case 'toggle-sound':
        timer.updateSettings({ soundEnabled: !timer.state.settings.soundEnabled })
        break
      case 'settings':
        setShowSettings(true)
        break
    }
    setCommandOpen(false)
  }
  
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
      setCommandOpen(false)
    }
  }, !showSettings && !commandOpen)
  
  // Setup keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main className="container mx-auto pt-24 pb-16 px-4 md:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Focus Sessions
            </h1>
            <p className="text-muted-foreground">
              Boost your productivity with structured work sessions
            </p>
          </div>

          {/* Command Palette Button */}
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setCommandOpen(true)}
            >
              <Command className="h-4 w-4" />
              Command Palette
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Main Content with Bento Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Timer Section - Main Focus Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Session Templates Carousel */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Templates</CardTitle>
                  <CardDescription>Choose a preset or customize your own</CardDescription>
                </CardHeader>
                <CardContent>
                  <Carousel className="w-full">
                    <CarouselContent>
                      {sessionTemplates.map((template) => (
                        <CarouselItem key={template.id} className="md:basis-1/2 lg:basis-1/3">
                          <Card
                            className="cursor-pointer hover:shadow-lg transition-all duration-200"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <div className={`p-6 bg-gradient-to-br ${template.color} rounded-lg text-white`}>
                              <template.icon className="h-8 w-8 mb-2" />
                              <h3 className="font-semibold">{template.name}</h3>
                              <p className="text-sm opacity-90">
                                {template.duration}min / {template.break}min
                              </p>
                            </div>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </CardContent>
              </Card>

              {/* Main Timer Card */}
              <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50">
                <CardContent className="p-8">
                    {/* Timer Mode Toggle with Animation */}
                    <div className="flex justify-center mb-6">
                      <ToggleGroup 
                        type="single" 
                        value={timer.state.mode}
                        onValueChange={(value) => value && timer.switchMode(value as 'focus' | 'break')}
                        className="bg-muted rounded-lg p-1"
                      >
                        <ToggleGroupItem value="focus" className="gap-2">
                          <Brain className="h-4 w-4" />
                          Focus
                        </ToggleGroupItem>
                        <ToggleGroupItem value="break" className="gap-2">
                          <Coffee className="h-4 w-4" />
                          Break
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Timer Display */}
                    <div className="flex justify-center my-8">
                      <div className="relative">
                        <TimerDisplay
                          time={timer.state.timeLeft}
                          initialTime={timer.state.initialTime}
                          sessionStartTime={timer.state.sessionStartTime}
                          mode={timer.state.mode === 'focus' ? 'work' : 'break'}
                          isRunning={timer.state.status === 'running'}
                        />
                      </div>
                    </div>

                    {/* Timer Controls with Hover Effects */}
                    <div className="flex justify-center gap-3 mb-6">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Timer className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <h4 className="font-medium leading-none">Quick Timer</h4>
                            <div className="grid grid-cols-4 gap-2">
                              {[15, 25, 45, 60].map((min) => (
                                <Button
                                  key={min}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    timer.setFocusDuration(min)
                                    toast({ title: `Timer set to ${min} minutes` })
                                  }}
                                >
                                  {min}m
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

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
                        size="icon"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={timer.stop}
                        variant="outline"
                        size="icon"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Session Progress with Gradient */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Session Progress</span>
                        <span className="font-medium">{Math.round(timer.progress)}%</span>
                      </div>
                      <Progress value={timer.progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

              {/* Goals Section with Context Menu */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Focus Goals</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      >
                        {viewMode === 'grid' ? <ListTodo className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add Goal with Command Input Style */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          ref={newGoalInputRef}
                          value={newGoalText}
                          onChange={(e) => setNewGoalText(e.target.value)}
                          placeholder="What do you want to focus on?"
                          className="pl-9"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddGoal()
                            }
                          }}
                        />
                      </div>
                      <Button onClick={handleAddGoal} disabled={!newGoalText.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                      </Button>
                    </div>

                    <Separator />

                    {/* Goals Grid/List with Context Menu */}
                    <ScrollArea className="h-[300px]">
                      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
                        {goals.goals.map((goal) => (
                          <ContextMenu key={goal.id}>
                            <ContextMenuTrigger>
                              <Card 
                                className={`p-4 cursor-pointer transition-all border-2 border-transparent hover:border-primary/20 ${
                                  goal.completed ? 'opacity-60' : 'hover:shadow-lg'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full mt-0.5"
                                    onClick={() => goals.toggleGoal(goal.id)}
                                  >
                                    {goal.completed ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border-2 border-primary" />
                                    )}
                                  </Button>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${
                                      goal.completed ? 'line-through text-muted-foreground' : ''
                                    }`}>
                                      {goal.text}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Est. {goal.estimatedMinutes}m
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem onClick={() => goals.toggleGoal(goal.id)}>
                                {goal.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => setSelectedGoal(goal)}>
                                Edit Goal
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem 
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="text-destructive"
                              >
                                Delete Goal
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    </ScrollArea>

                    {goals.completedGoals.length > 0 && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between">
                            <span>Completed Goals ({goals.completedGoals.length})</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="space-y-2">
                            {goals.completedGoals.map((goal) => (
                              <Card key={goal.id} className="p-3 bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <Check className="h-4 w-4 text-green-500" />
                                  <span className="text-sm line-through text-muted-foreground">
                                    {goal.text}
                                  </span>
                                </div>
                              </Card>
                            ))}
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={goals.clearCompleted}
                            >
                              Clear All Completed
                            </Button>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Stats and Calendar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Live Stats with Hover Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Today's Stats</CardTitle>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Performance Insights</h4>
                          <p className="text-xs text-muted-foreground">
                            You're {stats.todaysStats.completedSessions > 4 ? 'exceeding' : 'meeting'} your daily goals!
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Best Streak</p>
                              <p className="text-lg font-bold">{stats.currentStreak} days</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Weekly Avg</p>
                              <p className="text-lg font-bold">
                                {Math.round(stats.weeklyStats.reduce((a, b) => a + b.focusTime, 0) / 7 / 3600)}h
                              </p>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p className="text-2xl font-bold">{stats.todaysStats.completedSessions}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Focus Time</p>
                      <p className="text-2xl font-bold">
                        {Math.floor(stats.todaysStats.focusTime / 3600)}h
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Streak</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        {stats.currentStreak}
                        <Flame className="h-4 w-4 text-orange-500" />
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Goals</p>
                      <p className="text-2xl font-bold">
                        {goals.completedGoals.length}/{goals.goals.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar for Session History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Session Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    modifiers={{
                      hasSession: stats.recentSessions.map(s => 
                        new Date(s.startTime)
                      ).filter(d => 
                        d.getMonth() === new Date().getMonth()
                      )
                    }}
                    modifiersStyles={{
                      hasSession: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'white',
                        borderRadius: '4px'
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* AI Coach */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      AI Focus Coach
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="border-0 bg-white/50 dark:bg-black/20">
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      {timer.state.mode === 'focus' 
                        ? goals.pendingGoals.length > 0
                          ? `Focus on "${goals.pendingGoals[0].text}" for maximum productivity.`
                          : "Focus on one task at a time for maximum productivity."
                        : "Take a proper break! Step away from your screen and relax."
                      }
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs">Next Achievement: Focus Master</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Command Dialog */}
          <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Timer">
                {quickActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleCommand(action.id)}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.label}</span>
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                      {action.shortcut}
                    </kbd>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Templates">
                {sessionTemplates.map((template) => (
                  <CommandItem
                    key={template.id}
                    onSelect={() => {
                      handleTemplateSelect(template)
                      setCommandOpen(false)
                    }}
                  >
                    <template.icon className="mr-2 h-4 w-4" />
                    <span>{template.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {template.duration}m / {template.break}m
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </CommandDialog>

          {/* Mobile Drawer for Settings */}
          <Drawer open={showSettings} onOpenChange={setShowSettings}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Timer Settings</DrawerTitle>
                <DrawerDescription>
                  Configure your focus and break durations
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
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
              <DrawerFooter>
                <Button onClick={() => setShowSettings(false)}>Save Changes</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </main>
        
        <Footer />
      </div>
    </TooltipProvider>
  )
}

export default SessionsEnhanced
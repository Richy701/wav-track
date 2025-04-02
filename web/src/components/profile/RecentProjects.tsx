import React, { useState, memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Clock,
  Calendar,
  ClockCounterClockwise,
  Funnel,
  ArrowsDownUp,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  ArrowClockwise,
  MusicNote,
  ChartLine,
  CheckCircle,
  Star,
  Trophy,
  Flame,
  Sparkles,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/hooks/useProjects'
import {
  formatDistanceToNowStrict,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  subDays,
  format,
  isSameDay,
} from 'date-fns'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const filters = ['All', 'In Progress', 'Completed']
const sortOptions = ['Newest', 'Oldest', 'Most Progress', 'Least Progress']

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const minutes = differenceInMinutes(now, date)
  const hours = differenceInHours(now, date)
  const days = differenceInDays(now, date)

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

// Add these helper functions before the RecentProjects component
const calculateStreak = (projects: Project[]) => {
  const today = new Date()
  let currentStreak = 0
  let date = today

  while (true) {
    // Check if there was any activity on this date
    const hasActivity = projects.some(project => {
      // Check for project updates on this date
      const projectUpdated = isSameDay(new Date(project.lastModified), date)
      return projectUpdated
    })

    if (!hasActivity) break
    currentStreak++
    date = subDays(date, 1)
  }

  return currentStreak
}

const calculateTotalBeats = (projects: Project[]) => {
  // Count each project update as a beat
  return projects.reduce((total, project) => {
    const daysSinceCreation = differenceInDays(
      new Date(project.lastModified),
      new Date(project.dateCreated)
    )
    // Estimate beats based on project duration and status
    const estimatedBeats = Math.max(1, Math.ceil(daysSinceCreation / 7))
    return total + estimatedBeats
  }, 0)
}

const calculateCompletedProjects = (projects: Project[]) => {
  return projects.filter(project => project.status === 'completed').length
}

// Calculate project activity data for the last 7 days
const getProjectActivityData = (projects: Project[]) => {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i)
    // Get activity on this date from all projects
    const projectsUpdatedToday = projects.filter(p => isSameDay(new Date(p.lastModified), date))

    // Count beats based on project updates
    const beatsCreated = projectsUpdatedToday.length // Each project update counts as a beat

    return {
      date,
      beats: beatsCreated,
      label: format(date, 'MMM d'),
      completed: projectsUpdatedToday.filter(p => p.status === 'completed').length,
    }
  })

  return last7Days
}

// Add a helper function to calculate unique genres
const calculateUniqueGenres = (projects: Project[]) => {
  const uniqueGenres = new Set(projects.map(project => project.genre))
  return uniqueGenres.size
}

// Memoize the custom tooltip component
const CustomTooltip = memo(({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in zoom-in duration-200"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
    >
      <div className="text-xs font-medium text-muted-foreground mb-1">
        {format(payload[0].payload.date, 'MMM d, yyyy')}
      </div>
      {payload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: entry.color }}
        >
          <span>
            {entry.value} {entry.dataKey}
          </span>
        </div>
      ))}
    </div>
  )
})

CustomTooltip.displayName = 'CustomTooltip'

export function RecentProjects() {
  const { 
    projects, 
    isLoading, 
    currentPage,
    totalPages,
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
    projectsPerPage
  } = useProjects()
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const productivityData = getProjectActivityData(projects)
  const totalBeats = productivityData.reduce((sum, day) => sum + day.beats, 0)
  const totalCompleted = productivityData.reduce((sum, day) => sum + day.completed, 0)

  // Filter and sort projects
  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'In Progress') return project.status === 'in-progress'
    if (activeFilter === 'Completed') return project.status === 'completed'
    return true
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      case 'Oldest':
        return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
      case 'Most Progress':
        return (b.completionPercentage || 0) - (a.completionPercentage || 0)
      case 'Least Progress':
        return (a.completionPercentage || 0) - (b.completionPercentage || 0)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
          <p className="text-sm text-muted-foreground">Your latest production work</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Funnel className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {filters.map(filter => (
                <DropdownMenuItem
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={activeFilter === filter ? 'bg-accent' : ''}
                >
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowsDownUp className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {sortOptions.map(option => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={sortBy === option ? 'bg-accent' : ''}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading projects...
          </div>
        ) : sortedProjects.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No projects found. Create your first project to get started!
          </div>
        ) : (
          sortedProjects.map(project => (
            <Card
              key={project.id}
              className="group relative hover:shadow-lg hover:scale-[1.02] transition-all duration-300 rounded-xl overflow-hidden border-muted/50 hover:border-primary/20"
            >
              <CardContent className="p-5 space-y-4">
                {/* Project Header with Title and Badge */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 whitespace-nowrap ${
                      project.status === 'completed'
                        ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                        : project.status === 'mastering'
                          ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                          : project.status === 'mixing'
                            ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                            : project.status === 'in-progress'
                              ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                              : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    }`}
                  >
                    {project.status.replace('-', ' ')}
                  </Badge>
                </div>

                {/* Project Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{formatTimeAgo(new Date(project.dateCreated))}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                    <MusicNote className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{project.bpm} BPM</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                    <MusicNote className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{project.key}</span>
                  </div>
                  {project.genre && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 text-primary border border-primary/10">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{project.genre}</span>
                    </div>
                  )}
                </div>

                {/* Project Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary/5 text-primary border border-primary/10"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium tabular-nums">
                      {project.completionPercentage || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (project.completionPercentage || 0) === 100
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : (project.completionPercentage || 0) >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : (project.completionPercentage || 0) >= 50
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                              : (project.completionPercentage || 0) >= 25
                                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                : 'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${project.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {projects.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center mt-12 mb-20 space-y-3"
        >
          <p className="text-sm text-zinc-400">Showing all {projects.length} projects</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoadingMore}
              className={cn(
                "px-4 py-2 rounded-full border border-zinc-700 text-zinc-400",
                "hover:bg-zinc-800 transition",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                disabled={isLoadingMore}
                className={cn(
                  "w-10 h-10 rounded-full font-semibold transition",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  currentPage === i + 1
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "text-zinc-300 hover:bg-zinc-800"
                )}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoadingMore}
              className={cn(
                "px-4 py-2 rounded-full border border-zinc-700 text-zinc-400",
                "hover:bg-zinc-800 transition",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              Next →
            </button>
          </div>
        </motion.div>
      )}

      {/* Productivity Chart Section */}
      <div className="col-span-full">
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Productivity This Week</h2>
          <p className="text-sm text-muted-foreground">
            Track your beat-making progress over the past 7 days
          </p>
        </div>
        <Card className="border-muted/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ChartLine className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Weekly Activity</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/80" />
                  <span>Beats ({totalBeats})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span>Completed ({totalCompleted})</span>
                </div>
              </div>
            </div>

            <div 
              className="h-[120px] w-full"
              style={{ 
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={productivityData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="beatsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="rgb(217, 70, 239)" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="rgb(5, 150, 105)" stopOpacity={0.6} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Line
                    type="monotone"
                    dataKey="beats"
                    stroke="url(#beatsGradient)"
                    strokeWidth={2}
                    dot={false}
                    filter="url(#glow)"
                    activeDot={{
                      r: 4,
                      fill: '#8b5cf6',
                      strokeWidth: 2,
                      stroke: 'white',
                      className: 'dark:stroke-zinc-900 drop-shadow-md',
                    }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="url(#completedGradient)"
                    strokeWidth={2}
                    dot={false}
                    filter="url(#glow)"
                    activeDot={{
                      r: 4,
                      fill: '#10b981',
                      strokeWidth: 2,
                      stroke: 'white',
                      className: 'dark:stroke-zinc-900 drop-shadow-md',
                    }}
                    isAnimationActive={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'currentColor',
                      fontSize: 10,
                      opacity: 0.5,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: 'currentColor',
                      fontSize: 10,
                      opacity: 0.5,
                    }}
                    dx={-10}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={false}
                    cursor={{ stroke: 'rgb(99, 102, 241)', strokeWidth: 1 }}
                    wrapperStyle={{ 
                      transition: 'none',
                      transform: 'translate3d(0, 0, 0)',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      perspective: 1000,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Achievements</h2>
          <p className="text-sm text-muted-foreground">
            Track your milestones and unlock new badges as you progress.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Beat Making Master',
              description: 'Created 100+ beats',
              icon: <Trophy weight="fill" />,
              progress: Math.min(100, (calculateTotalBeats(projects) / 100) * 100),
              current: calculateTotalBeats(projects),
              target: 100,
              color: 'from-amber-500 to-yellow-500',
              borderColor: 'group-hover:border-amber-500/20',
            },
            {
              title: 'Productivity Streak',
              description: '7 days in a row',
              icon: <Flame weight="fill" />,
              progress: Math.min(100, (calculateStreak(projects) / 7) * 100),
              current: calculateStreak(projects),
              target: 7,
              color: 'from-orange-500 to-red-500',
              borderColor: 'group-hover:border-orange-500/20',
            },
            {
              title: 'Genre Explorer',
              description: 'Created beats in 5 different genres',
              icon: <Star weight="fill" />,
              progress: Math.min(100, (calculateUniqueGenres(projects) / 5) * 100),
              current: calculateUniqueGenres(projects),
              target: 5,
              color: 'from-purple-500 to-fuchsia-500',
              borderColor: 'group-hover:border-purple-500/20',
            },
          ].map((achievement, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.01] ${achievement.borderColor}`}
            >
              <CardContent className="p-5">
                {/* Gradient overlay on hover */}
                <span
                  className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-50 
                               transition-opacity duration-200 pointer-events-none ${achievement.color}/5`}
                />

                {/* Header with Icon */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-2.5 rounded-full bg-gradient-to-br ${achievement.color} text-white 
                                shadow-sm transition-transform duration-200 group-hover:scale-105`}
                  >
                    {React.cloneElement(achievement.icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium tabular-nums">
                      {achievement.current}/{achievement.target}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${achievement.color} 
                               transition-all duration-300 ease-out`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>

                {achievement.progress >= 100 && (
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="outline"
                      className={`bg-gradient-to-r ${achievement.color} border-0 text-white text-xs`}
                    >
                      Completed
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

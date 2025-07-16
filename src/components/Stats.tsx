import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ChartLineUp,
  PencilSimple,
  CheckCircle,
  MusicNote,
  Clock,
  Calendar,
  Trophy,
  Star,
  Target,
  Medal,
  ShareNetwork,
  Download,
  Sparkle,
  FileXls,
  CalendarCheck,
  ChartBar as BarChartIcon,
  ChartLine as LineChartIcon,
} from '@phosphor-icons/react'

import { BeatsChart } from './stats/BeatsChart'
import { BeatBarChart } from './stats/BeatBarChart'
import { TimeRangeSelector } from './stats/TimeRangeSelector'
import { getTotalBeatsInTimeRange, getBeatsCreatedByProject, getBeatsDataForChart, getTotalSessionTime } from '@/lib/data'
import { Project, Session, BeatActivity } from '@/lib/types'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { useProjects } from '@/hooks/useProjects'
import { BarChart, LineChart } from 'lucide-react'
import { MonthlyBreakdownDialog } from './stats/MonthlyBreakdownDialog'
import { YearInReviewDialog } from './stats/YearInReviewDialog'
import { BeatsStar } from './icons/BeatsStar'
import { Music } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface StatsProps {
  sessions: Session[]
  selectedProject?: Project | null
  beatActivities: BeatActivity[]
}

interface YearInReview {
  year: number
  totalBeats: number
  completedProjects: number
  studioTime: string
  monthlyStats: {
    month: string
    beats: number
    completed: number
    studioTime: number
  }[]
  topGenres: string[]
  beatGoal: number
  topGenre?: string
}

// Tooltip helper functions
const getTooltipTitle = (title: string) => {
  switch (title) {
    case 'Productivity Score':
      return 'Productivity Score'
    case 'Total Beats':
      return 'Total Beats Created'
    case 'Completed Projects':
      return 'Completed Projects'
    case 'Completion Rate':
      return 'Project Completion Rate'
    default:
      return title
  }
}

const getDefaultTooltip = (title: string) => {
  switch (title) {
    case 'Productivity Score':
      return 'Your overall productivity score based on beats created and projects completed. This metric helps you track your progress and stay motivated.'
    case 'Total Beats':
      return 'The total number of beats you have created across all your projects. This includes both finished and in-progress beats.'
    case 'Completed Projects':
      return 'The number of projects you have successfully finished. This shows your ability to see projects through to completion.'
    case 'Completion Rate':
      return 'The percentage of projects you have completed compared to the total number of projects you have started.'
    default:
      return 'Click to learn more about this metric.'
  }
}

export default function Stats({ sessions, selectedProject, beatActivities }: StatsProps) {
  const { allProjects: projects } = useProjects()
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'year'>('week')
  const [totalBeatsCreated, setTotalBeatsCreated] = useState(0)
  const [totalBeatsInPeriod, setTotalBeatsInPeriod] = useState(0)
  const [totalSessionTime, setTotalSessionTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [lastBeatUpdate, setLastBeatUpdate] = useState(Date.now())
  const [refreshKey, setRefreshKey] = useState(0)
  const [yearInReview, setYearInReview] = useState<YearInReview | null>(null)
  const [showYearInReview, setShowYearInReview] = useState(false)
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false)
  const [isGeneratingReview, setIsGeneratingReview] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Fetch session time when component mounts
  useEffect(() => {
    const fetchSessionTime = async () => {
      try {
        const time = await getTotalSessionTime()
        setTotalSessionTime(time)
      } catch (error) {
        console.error('Error fetching session time:', error)
      }
    }
    fetchSessionTime()
  }, [])

  // Fetch beat counts when projects or selected project changes
  useEffect(() => {
    const fetchBeatCounts = async () => {
      setIsLoading(true)
      try {
        if (projects.length === 0) {
          setTotalBeatsCreated(0)
          setTotalBeatsInPeriod(0)
          return
        }

        // Calculate total beats across all projects or selected project
        const periodBeats = await getTotalBeatsInTimeRange(timeRange, selectedProject?.id ?? null)
        setTotalBeatsInPeriod(periodBeats)

        if (selectedProject) {
          const beats = await getBeatsCreatedByProject(selectedProject.id)
          setTotalBeatsCreated(beats)
        } else {
          const beatPromises = projects.map(project => getBeatsCreatedByProject(project.id))
          const beatCounts = await Promise.all(beatPromises)
          const total = beatCounts.reduce((sum, count) => sum + count, 0)
          setTotalBeatsCreated(total)
        }
      } catch (error) {
        console.error('Error fetching beat counts:', error)
        setTotalBeatsCreated(0)
        setTotalBeatsInPeriod(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBeatCounts()
  }, [projects, selectedProject, timeRange, refreshKey])

  // Update when new beats are added or project is selected
  useEffect(() => {
    const checkForNewBeats = () => {
      if (!beatActivities || beatActivities.length === 0) return
      
      const latestBeat = beatActivities[beatActivities.length - 1]
      if (latestBeat && new Date(latestBeat.date).getTime() > lastBeatUpdate) {
        setLastBeatUpdate(Date.now())
        setRefreshKey(prev => prev + 1)
      }
    }

    // Check for new beats immediately
    checkForNewBeats()

    // Only check every 5 seconds if there are recent beats
    const interval = setInterval(checkForNewBeats, 5000)
    return () => clearInterval(interval)
  }, [lastBeatUpdate, beatActivities])

  // Count completed projects
  const completedProjects = projects.filter(project => project.status === 'completed').length

  // Calculate productivity score
  const productivityScore = useMemo(() => {
    if (projects.length === 0) return 0

    // Base score from total beats (max 50 points)
    const beatsScore = Math.min(50, Math.round((totalBeatsCreated / 20) * 50))

    // Score from completed projects (max 30 points)
    const completionScore = Math.min(30, completedProjects * 5)

    // Score from active sessions (max 20 points)
    const sessionScore = Math.min(20, Math.round((totalSessionTime / 60 / 10) * 20))

    // Total score (max 100)
    return beatsScore + completionScore + sessionScore
  }, [projects.length, totalSessionTime, totalBeatsCreated, completedProjects])

  // Get recent projects sorted by last modified
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 3)

  // Calculate achievements
  const achievements = [
    {
      id: 'first_beat',
      title: 'First Beat',
      description: 'Created your first project',
      icon: <Star className="h-4 w-4" weight="fill" />,
      unlocked: projects.length > 0,
      date:
        projects.length > 0
          ? format(new Date(projects[projects.length - 1].dateCreated), 'MMM yyyy')
          : null,
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'ten_beats',
      title: 'Beat Master',
      description: 'Created 10+ beats',
      icon: <Trophy className="h-4 w-4" weight="fill" />,
      unlocked: totalBeatsCreated >= 10,
      count: totalBeatsCreated,
      color: 'from-indigo-500 to-violet-500',
      borderColor: 'border-indigo-500/20',
    },
    {
      id: 'five_completed',
      title: 'Finisher',
      description: 'Completed 5+ projects',
      icon: <Target className="h-4 w-4" weight="fill" />,
      unlocked: completedProjects >= 5,
      count: completedProjects,
      color: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500/20',
    },
  ]

  const handleExportStats = () => {
    const stats = {
      totalBeats: totalBeatsCreated,
      completedProjects,
      productivityScore,
      achievements: achievements.map(a => ({
        title: a.title,
        unlocked: a.unlocked,
        date: a.date,
        count: a.count,
      })),
      recentActivity: recentProjects.map(p => ({
        title: p.title,
        date: format(new Date(p.lastModified), 'MMM d'),
        bpm: p.bpm,
        status: p.status,
      })),
    }

    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beat-stats-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Stats exported successfully!', {
      description: 'Your stats have been downloaded as JSON.',
    })
  }

  const handleShareStats = () => {
    const shareText =
      `🎵 Beat Stats 🎵\n\n` +
      `I've created ${totalBeatsCreated} beats and completed ${completedProjects} projects!\n` +
      `Productivity score: ${productivityScore}%\n\n` +
      `Unlocked achievements:\n` +
      achievements
        .filter(a => a.unlocked)
        .map(a => `✨ ${a.title}`)
        .join('\n')

    if (navigator.share) {
      navigator
        .share({
          title: 'My Beat Stats',
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback to clipboard if share API is not available
          navigator.clipboard.writeText(shareText)
          toast.success('Stats copied to clipboard!', {
            description: 'Share your progress with others.',
          })
        })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText)
      toast.success('Stats copied to clipboard!', {
        description: 'Share your progress with others.',
      })
    }
  }

  // Memoize the year in review data generation
  const generateYearInReview = useCallback(async () => {
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)

    // Filter projects and sessions for current year
    const yearProjects = projects.filter(p => new Date(p.dateCreated) >= yearStart)
    const yearSessions = sessions.filter(s => new Date(s.created_at) >= yearStart)

    // Calculate year-specific stats in parallel
    const [yearBeats, yearCompleted, yearStudioTime, monthlyStats, topGenres] = await Promise.all([
      // Calculate total beats
      Promise.all(yearProjects.map(project => getBeatsCreatedByProject(project.id)))
        .then(counts => counts.reduce((total, count) => total + count, 0)),
      
      // Calculate completed projects
      yearProjects.filter(p => p.status === 'completed').length,
      
      // Calculate studio time (convert minutes to hours)
      yearSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60,
      
      // Calculate monthly stats
      Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const monthStart = new Date(currentYear, i, 1)
          const monthEnd = new Date(currentYear, i + 1, 0)
          const monthProjects = yearProjects.filter(p => {
            const date = new Date(p.dateCreated)
            return date >= monthStart && date <= monthEnd
          })
          const monthSessions = yearSessions.filter(s => {
            const date = new Date(s.created_at)
            return date >= monthStart && date <= monthEnd
          })

          const monthBeats = await Promise.all(
            monthProjects.map(project => getBeatsCreatedByProject(project.id))
          ).then(counts => counts.reduce((total, count) => total + count, 0))

          return {
            month: format(monthStart, 'MMM'),
            beats: monthBeats,
            completed: monthProjects.filter(p => p.status === 'completed').length,
            studioTime: monthSessions.reduce((total, s) => total + s.duration, 0),
          }
        })
      ),
      
      // Calculate top genres
      Promise.resolve(
        Object.entries(
          yearProjects.reduce(
            (acc, p) => {
              acc[p.genre || 'Uncategorized'] = (acc[p.genre || 'Uncategorized'] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([genre]) => genre)
      )
    ])

    return {
      year: currentYear,
      totalBeats: yearBeats,
      completedProjects: yearCompleted,
      studioTime: `${Math.floor(yearStudioTime)}h`, // Format as "Xh"
      monthlyStats,
      topGenres,
      beatGoal: 100, // Default goal
      topGenre: topGenres[0] || 'Uncategorized'
    } as YearInReview
  }, [projects, sessions])

  // Pre-calculate year in review data when projects or sessions change
  useEffect(() => {
    let isMounted = true

    const preCalculateYearInReview = async () => {
      try {
        const review = await generateYearInReview()
        if (isMounted) {
          setYearInReview(review)
          setIsGeneratingReview(false)
        }
      } catch (error) {
        console.error('Error pre-calculating year in review:', error)
        if (isMounted) {
          setIsGeneratingReview(false)
        }
      }
    }

    setIsGeneratingReview(true)
    preCalculateYearInReview()

    return () => {
      isMounted = false
    }
  }, [generateYearInReview])

  const handleExportCSV = async () => {
    const yearReview = generateYearInReview()

    // Create CSV content
    const csvRows = [
      // Header row
      ['Year in Review', (await yearReview).year],
      [],
      ['Overall Stats'],
      ['Total Beats', (await yearReview).totalBeats],
      ['Completed Projects', (await yearReview).completedProjects],
      ['Studio Time', (await yearReview).studioTime],
      [],
      ['Monthly Breakdown'],
      ['Month', 'Beats Created', 'Completed Projects', 'Studio Time (hours)'],
      ...(await yearReview).monthlyStats.map(stat => [
        stat.month,
        stat.beats,
        stat.completed,
        (stat.studioTime / 60).toFixed(1),
      ]),
      [],
      ['Top Genres'],
      ...(await yearReview).topGenres.map((genre, i) => [`${i + 1}. ${genre}`]),
    ]

    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beat-stats-${(await yearReview).year}-review.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Year in Review exported!', {
      description: 'Your stats have been downloaded as CSV.',
    })
  }

  const handleMonthlyBreakdown = () => {
    setShowMonthlyBreakdown(true)
  }

  const handleYearInReview = () => {
    setShowYearInReview(true)
  }

  // Add mouse tracking for the Year in Review button
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    button.style.setProperty('--mouse-x', `${x}px`);
    button.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 animate-fade-in">
      <div className="rounded-lg p-3 sm:p-4 lg:p-6 lg:col-span-3 overflow-hidden flex flex-col bg-white dark:bg-[rgb(12,13,13)] border border-border shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-4">
          {/* Stat Block */}
          <div className="flex flex-col items-start gap-2 font-sans">
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold leading-none">{totalBeatsInPeriod}</span>
              {totalBeatsInPeriod > 0 ? (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-600/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              ) : null}
            </div>
            <span className="text-sm text-muted-foreground">beats this {timeRange}</span>
            <span className="text-sm font-semibold text-foreground">Total Beats</span>
          </div>

          {/* Title Block */}
          <div className="text-center sm:text-right">
            <h2 className="text-base sm:text-lg font-semibold leading-tight">Beat Creation Activity</h2>
            <p className="text-sm text-muted-foreground">Last {timeRange === 'day' ? '24 hours' : timeRange === 'week' ? '7 days' : '12 months'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-card/30 p-4 mb-6 bg-white dark:bg-[rgb(12,13,13)]">
          <div className="flex justify-between items-center mb-3">
            {/* Chart Type Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-zinc-900/80 border border-zinc-700 shadow-sm">
              <button
                onClick={() => setChartType('bar')}
                aria-label="Switch to bar chart view"
                className={cn(
                  "p-1 rounded-full duration-200 flex items-center justify-center",
                  chartType === 'bar'
                    ? "bg-violet-700/80 text-white"
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-violet-400"
                )}
              >
                <BarChart className="h-5 w-5" />
              </button>
              <button
                onClick={() => setChartType('line')}
                aria-label="Switch to line chart view"
                className={cn(
                  "p-1 rounded-full duration-200 flex items-center justify-center",
                  chartType === 'line'
                    ? "bg-violet-700/80 text-white"
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-violet-400"
                )}
              >
                <LineChart className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-2">
              {["Day", "Week", "Year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range.toLowerCase() as 'day' | 'week' | 'year')}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full font-medium duration-150",
                    timeRange === range.toLowerCase()
                      ? "bg-violet-500/15 text-violet-500 shadow-sm"
                      : "text-muted-foreground hover:bg-violet-500/7 hover:text-violet-500"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full flex-grow">
            <div className="h-[380px]">
              <BeatBarChart
                projects={projects}
                selectedProject={selectedProject}
                timeRange={timeRange}
                chartType={chartType}
              />
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-4 sm:mt-6 pt-3 border-t">
          <h4 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
            Achievements
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={cn(
                  'flex flex-col items-center p-2 sm:p-3 lg:p-4 rounded-lg aspect-square group relative isolate',
                  achievement.unlocked
                    ? `bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:scale-[1.02] hover:shadow-lg ${achievement.borderColor}`
                    : 'bg-muted/30 opacity-50 hover:opacity-60 border border-muted-foreground/10'
                )}
              >
                {/* Background glow effect */}
                {achievement.unlocked && (
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg',
                      achievement.color.replace('from-', 'from-').replace('to-', 'to-') + '/10'
                    )}
                    style={{ zIndex: -1 }}
                  />
                )}

                <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                  <div
                    className={cn(
                      'p-2 sm:p-2.5 rounded-full mb-2 sm:mb-3 flex items-center justify-center duration-300',
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color} text-white group-hover:scale-110 group-hover:shadow-md shadow-sm`
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {React.cloneElement(achievement.icon, {
                      className: cn(
                        'h-4 w-4',
                        achievement.unlocked ? 'text-white' : 'text-muted-foreground'
                      )
                    })}
                  </div>
                  <div className="text-center relative z-10 min-w-0 w-full px-1">
                    <p
                      className={cn(
                        'text-[11px] sm:text-xs font-medium truncate',
                        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {achievement.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 text-wrap leading-tight">
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <p
                        className={cn(
                          'text-[10px] sm:text-[11px] mt-0.5 font-medium truncate',
                          achievement.color.includes('amber')
                            ? 'text-amber-600'
                            : achievement.color.includes('indigo')
                              ? 'text-indigo-600'
                              : 'text-emerald-600'
                        )}
                      >
                        {achievement.date ||
                          `${achievement.count} ${achievement.id === 'twenty_hours' ? 'hours' : ''}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export/Share Section */}
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-medium text-xs text-muted-foreground mb-3">Share Your Progress</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={handleShareStats}
              className="h-[140px] w-full rounded-xl border bg-white/5 dark:bg-black/20 backdrop-blur-[2px] overflow-hidden text-balance bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-primary/10 transition-all duration-500 hover:-translate-y-1 hover:from-primary/20 hover:via-primary/10 hover:to-transparent group relative focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-violet-500/40 dark:focus:ring-violet-500/40"
            >
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-3 space-y-2 sm:space-y-3">
                <div className="rounded-lg p-2 bg-white/10 dark:bg-black/20 ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 text-primary">
                  <ShareNetwork className="h-5 w-5" weight="fill" />
                </div>
                <div className="space-y-1 max-w-[200px] min-w-0">
                  <h3 className="text-base font-semibold leading-tight tracking-tight text-primary-900 dark:text-primary-100 truncate">Share Progress</h3>
                  <p className="text-xs leading-snug text-primary-700/70 dark:text-primary-300/70 text-wrap">Share your achievements</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleMonthlyBreakdown}
              className="h-[140px] w-full rounded-xl border bg-white/5 dark:bg-black/20 backdrop-blur-[2px] overflow-hidden text-balance bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/10 transition-all duration-500 hover:-translate-y-1 hover:from-violet-500/20 hover:via-violet-500/10 hover:to-transparent group relative focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-violet-500/40 dark:focus:ring-violet-500/40"
            >
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-3 space-y-2 sm:space-y-3">
                <div className="rounded-lg p-2 bg-white/10 dark:bg-black/20 ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 text-violet-500">
                  <Calendar className="h-5 w-5" weight="fill" />
                </div>
                <div className="space-y-1 max-w-[200px] min-w-0">
                  <h3 className="text-base font-semibold leading-tight tracking-tight text-violet-900 dark:text-violet-100 truncate">Monthly Breakdown</h3>
                  <p className="text-xs leading-snug text-violet-700/70 dark:text-violet-300/70 text-wrap">Track monthly progress</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleYearInReview}
              onMouseMove={handleMouseMove}
              className="h-[140px] w-full rounded-xl border bg-white/5 dark:bg-black/20 backdrop-blur-[2px] overflow-hidden text-balance bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/10 transition-all duration-500 hover:-translate-y-1 hover:from-rose-500/20 hover:via-rose-500/10 hover:to-transparent group relative focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-violet-500/40 dark:focus:ring-violet-500/40"
            >
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-3 space-y-2 sm:space-y-3">
                <div className="rounded-lg p-2 bg-white/10 dark:bg-black/20 ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 text-rose-500">
                  <FileXls className="h-5 w-5" />
                </div>
                <div className="space-y-1 max-w-[200px] min-w-0">
                  <h3 className="text-base font-semibold leading-tight tracking-tight text-rose-900 dark:text-rose-100 truncate">
                    Year in Review
                  </h3>
                  <p className="text-xs leading-snug text-rose-700/70 dark:text-rose-300/70 text-wrap">
                    Download yearly stats
                  </p>
                </div>
              </div>
              <div
                className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-transparent transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: `radial-gradient(
                    600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                    rgba(244, 63, 94, 0.05),
                    transparent 40%
                  )`,
                }}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        <div className="rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:bg-accent/50 bg-white dark:bg-card border border-border">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-sm sm:text-base cursor-help">Productivity Score</h3>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-[300px]"
                  sideOffset={5}
                >
                  <div className="space-y-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      {getTooltipTitle('Productivity Score')}
                    </p>
                    <div
                      className="text-zinc-700 dark:text-zinc-300 space-y-2.5 leading-relaxed"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {getDefaultTooltip('Productivity Score')}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background flex items-center justify-center">
              <ChartLineUp className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{productivityScore}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Based on beats and completed projects</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:bg-accent/50 bg-white dark:bg-card border border-border">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-sm sm:text-base cursor-help">Total Beats</h3>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-[300px]"
                  sideOffset={5}
                >
                  <div className="space-y-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      {getTooltipTitle('Total Beats')}
                    </p>
                    <div
                      className="text-zinc-700 dark:text-zinc-300 space-y-2.5 leading-relaxed"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {getDefaultTooltip('Total Beats')}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background flex items-center justify-center">
              <MusicNote className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{totalBeatsCreated}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Across all projects</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:bg-accent/50 bg-white dark:bg-card border border-border">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-sm sm:text-base cursor-help">Completed Projects</h3>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-[300px]"
                  sideOffset={5}
                >
                  <div className="space-y-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      {getTooltipTitle('Completed Projects')}
                    </p>
                    <div
                      className="text-zinc-700 dark:text-zinc-300 space-y-2.5 leading-relaxed"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {getDefaultTooltip('Completed Projects')}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background flex items-center justify-center">
              <CheckCircle className="w-3 h-3" weight="fill" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{completedProjects}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Successfully finished</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-3 sm:p-4 transition-all hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:bg-accent/50 bg-white dark:bg-card border border-border">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-sm sm:text-base cursor-help">Completion Rate</h3>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-[300px]"
                  sideOffset={5}
                >
                  <div className="space-y-3">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      {getTooltipTitle('Completion Rate')}
                    </p>
                    <div
                      className="text-zinc-700 dark:text-zinc-300 space-y-2.5 leading-relaxed"
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {getDefaultTooltip('Completion Rate')}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-background flex items-center justify-center">
              <Target className="w-3 h-3" weight="fill" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">{projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Projects completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Dialog Components */}
      <MonthlyBreakdownDialog
        isOpen={showMonthlyBreakdown}
        onOpenChange={setShowMonthlyBreakdown}
        projects={projects}
        selectedProject={selectedProject}
      />

      {yearInReview && (
        <YearInReviewDialog
          isOpen={showYearInReview}
          onOpenChange={setShowYearInReview}
          yearInReview={yearInReview}
          onExport={handleExportCSV}
          isLoading={isGeneratingReview}
          title={`${yearInReview.year} Year in Review`}
          description="Your production journey this year"
        />
      )}
    </div>
  )
}

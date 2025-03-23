import { RegisterForm } from '@/components/auth/RegisterForm'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@/components/icons'
import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { cn } from '@/lib/utils'
import styles from './Register.module.css'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function Register() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('week')
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isLineChart, setIsLineChart] = useState(true)

  const handleSuccess = () => {
    navigate('/login')
  }

  // Sample data for different time ranges
  const chartData = {
    day: {
      labels: ['12am', '4am', '8am', '12pm', '4pm', '8pm', '11pm'],
      values: [0, 1, 2, 3, 2, 1, 0],
      total: 9,
    },
    week: {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      values: [2, 4, 3, 5, 1, 2, 1],
      total: 18,
    },
    month: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      values: [12, 15, 18, 14],
      total: 59,
    },
    year: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [8, 6, 12, 9, 15, 11, 13, 10, 14, 12, 9, 7],
      total: 126,
    },
  }

  const currentData = chartData[timeRange]

  // Calculate max value for scaling
  const maxValue = Math.max(...currentData.values)

  // Helper function to get height class
  const getHeightClass = (value: number) => {
    const percentage = Math.round(((value / maxValue) * 100) / 10) * 10
    return styles[`h-${percentage}`]
  }

  return (
    <div
      className={cn(
        'container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0',
        isDark ? 'bg-background' : 'bg-white'
      )}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/login')}
        className={cn(
          'absolute top-4 left-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 disabled:pointer-events-none z-50',
          isDark
            ? 'text-white hover:text-white/90 focus:ring-white/20'
            : 'text-white hover:text-white/90 focus:ring-white/20'
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        Back to login
      </button>

      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Left side - Dashboard Preview */}
      <div className="relative hidden h-full flex-col bg-gradient-to-b from-muted/50 to-muted p-6 lg:p-8 xl:p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-slow" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
        </div>

        {/* Logo and Brand */}
        <div className="relative z-20 flex flex-col items-center text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
            WavTrack
          </h1>
        </div>

        {/* App Visualization */}
        <div className="relative z-20 mt-8 rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-colors duration-300">
          {/* Dashboard Header */}
          <div className="p-6">
            {/* Time Period Selector */}
            <div className="flex justify-center items-center mb-8">
              <div className="inline-flex rounded-lg bg-white/5 p-1 backdrop-blur-sm">
                <button
                  onClick={() => setTimeRange('day')}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    timeRange === 'day'
                      ? 'bg-white/10 rounded-md text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    timeRange === 'week'
                      ? 'bg-white/10 rounded-md text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    timeRange === 'month'
                      ? 'bg-white/10 rounded-md text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    timeRange === 'year'
                      ? 'bg-white/10 rounded-md text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            {/* Beats Created Counter */}
            <div className="text-center space-y-1 mb-8">
              <div className="flex items-center justify-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 p-2 shadow-lg backdrop-blur-sm">
                  <Icons.trophy className="h-5 w-5 text-white/80" />
                </div>
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                  {currentData.total}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-base text-white/60">this {timeRange}</span>
                <span className="text-sm text-emerald-500">↑ 50%</span>
              </div>
              <h2 className="text-xl font-semibold text-white">Beats Created</h2>
            </div>

            {/* Chart Area */}
            <div className="mt-6 h-[180px] w-full max-w-3xl mx-auto px-8">
              <div
                className={`grid h-full w-full items-end gap-3 ${
                  timeRange === 'year'
                    ? 'grid-cols-12'
                    : timeRange === 'month'
                      ? 'grid-cols-4'
                      : 'grid-cols-7'
                }`}
              >
                {currentData.values.map((value, i) => (
                  <div key={i} className="relative h-full group">
                    <div className={cn(styles.chartBar, getHeightClass(value))}>
                      <div
                        className={cn(
                          styles.chartBarInner,
                          i === currentData.values.length - 1 && styles.chartBarLatest,
                          i === currentData.values.length - 2 && styles.chartBarSecondLatest,
                          i < currentData.values.length - 2 && styles.chartBarDefault,
                          'group-hover:' + styles.chartBarHover
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        styles.tooltip,
                        'bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-medium text-white/90 border border-white/10'
                      )}
                    >
                      {value} {value === 1 ? 'beat' : 'beats'}
                    </div>
                    <div className={styles.label}>{currentData.labels[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Legend */}
            <div className="mt-10 flex items-center justify-between text-xs max-w-3xl mx-auto px-8">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400/60" />
                <span className="text-white/60 font-medium">Beats Created</span>
              </div>
              <div className="text-white/40 font-medium">
                {timeRange === 'day'
                  ? 'Last 24 hours'
                  : timeRange === 'week'
                    ? 'Last 7 days'
                    : timeRange === 'month'
                      ? 'This month'
                      : '2024'}{' '}
                • Total: {currentData.total}
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="border-t border-white/10 p-6 bg-gradient-to-b from-transparent to-white/5">
            <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 p-4 text-center backdrop-blur-sm hover:from-white/15 hover:to-white/10 transition-colors duration-300">
                <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                  <Icons.star className="h-4 w-4 text-amber-500/80" />
                </div>
                <h4 className="text-sm font-medium text-white">First Beat</h4>
                <p className="mt-1 text-xs text-white/60">Created your first project</p>
                <div className="mt-2 text-xs text-emerald-500">Unlocked</div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 p-4 text-center backdrop-blur-sm hover:from-white/15 hover:to-white/10 transition-colors duration-300">
                <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center">
                  <Icons.trophy className="h-4 w-4 text-violet-500/80" />
                </div>
                <h4 className="text-sm font-medium text-white">Beat Master</h4>
                <p className="mt-1 text-xs text-white/60">Created 10+ beats</p>
                <div className="mt-2 text-xs text-violet-500">8/10 beats</div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 p-4 text-center backdrop-blur-sm hover:from-white/15 hover:to-white/10 transition-colors duration-300">
                <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-500/10 flex items-center justify-center">
                  <Icons.target className="h-4 w-4 text-sky-500/80" />
                </div>
                <h4 className="text-sm font-medium text-white">Finisher</h4>
                <p className="mt-1 text-xs text-white/60">Completed 5+ projects</p>
                <div className="mt-2 text-xs text-sky-500">3/5 completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-20 mt-auto">
          <div className="space-y-6">
            <p className="text-base font-medium leading-relaxed text-white/80 tracking-wide">
              Start your beat-making journey. Track progress, connect with producers, and level up
              your craft.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-sm font-medium text-white/60">WavTrack Team</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            <div className="flex items-center gap-4 text-white/80">
              <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                <Icons.daw className="h-4 w-4" />
              </div>
              <p className="text-sm">Track your progress across any DAW</p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                <Icons.microphone className="h-4 w-4" />
              </div>
              <p className="text-sm">Connect with other producers</p>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                <Icons.genres className="h-4 w-4" />
              </div>
              <p className="text-sm">Explore different genres and styles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="relative h-full flex items-center justify-center p-4 lg:p-8 xl:p-12">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create your producer profile</h1>
            <p className={cn('text-sm', isDark ? 'text-zinc-400' : 'text-zinc-600')}>
              Join the community and start tracking your music production journey
            </p>
          </div>

          <RegisterForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}

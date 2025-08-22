import React, { memo, Suspense, lazy } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { LoadingWrapper } from '@/components/ui/loading-wrapper'
import ProjectList from '@/components/ProjectList'
import Stats from '@/components/Stats'
import { MotivationalQuotes } from '@/components/MotivationalQuotes'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load AI Coach for better initial load performance
const AICoach = lazy(() => import('@/components/ai-coach/AICoach').then(module => ({ default: module.AICoach })))

// Memoized components for better performance
const MemoizedStats = memo(Stats)
const MemoizedProjectList = memo(ProjectList)
const MemoizedMotivationalQuotes = memo(MotivationalQuotes)
const MemoizedAICoach = memo(AICoach)

// Loading skeleton components for better UX
const StatsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-32 rounded-lg" />
    ))}
  </div>
)

const ProjectListLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} className="h-24 w-full rounded-lg" />
    ))}
  </div>
)

const QuotesLoadingSkeleton = () => (
  <Skeleton className="h-24 w-full rounded-lg" />
)

const AICoachLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
)

export function Dashboard() {
  const { projects, allProjects, isLoading: projectsLoading } = useProjects()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Primary Header Section */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Track your music production progress and stay motivated</p>
      </header>

      {/* Primary Stats Section */}
      <section aria-label="Statistics" className="animate-in slide-in-from-bottom-2 duration-500">
        <Suspense fallback={<StatsLoadingSkeleton />}>
          <LoadingWrapper
            loadingKey="stats"
            className="min-h-[8rem]"
            customLoader={<StatsLoadingSkeleton />}
          >
            <MemoizedStats sessions={[]} beatActivities={[]} />
          </LoadingWrapper>
        </Suspense>
      </section>

      {/* Main content grid with improved responsive layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Secondary Main Content - Projects */}
        <section 
          className="lg:col-span-2 animate-in slide-in-from-left-2 duration-500 delay-100" 
          aria-label="Projects"
        >
          <Suspense fallback={<ProjectListLoadingSkeleton />}>
            <LoadingWrapper
              loadingKey="projects"
              className="min-h-[600px] rounded-lg"
              customLoader={<ProjectListLoadingSkeleton />}
            >
              <MemoizedProjectList />
            </LoadingWrapper>
          </Suspense>
        </section>

        {/* Secondary Sidebar - Insights and Coaching */}
        <aside 
          className="space-y-6 animate-in slide-in-from-right-2 duration-500 delay-200" 
          aria-label="Insights and Coaching"
        >
          <div className="sticky top-6 space-y-6">
            {/* Tertiary - Motivational Quotes */}
            <section aria-label="Motivation">
              <Suspense fallback={<QuotesLoadingSkeleton />}>
                <LoadingWrapper
                  loadingKey="quotes"
                  className="min-h-[100px] rounded-lg"
                  customLoader={<QuotesLoadingSkeleton />}
                >
                  <MemoizedMotivationalQuotes />
                </LoadingWrapper>
              </Suspense>
            </section>

            {/* Tertiary - AI Coach */}
            <section aria-label="AI Coaching">
              <Suspense fallback={<AICoachLoadingSkeleton />}>
                <LoadingWrapper
                  loadingKey="ai-coach"
                  className="min-h-[480px] rounded-lg"
                  customLoader={<AICoachLoadingSkeleton />}
                >
                  <MemoizedAICoach />
                </LoadingWrapper>
              </Suspense>
            </section>
          </div>
        </aside>
      </div>
    </div>
  )
} 
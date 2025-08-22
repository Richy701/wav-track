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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your music production progress and stay motivated</p>
      </div>

      {/* Stats Section with improved loading */}
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
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 lg:grid-cols-1 md:grid-cols-1">
        {/* Projects section - takes 2 columns on xl screens */}
        <section 
          className="xl:col-span-2 animate-in slide-in-from-left-2 duration-500 delay-100" 
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

        {/* Sidebar section with quotes and AI coach */}
        <aside 
          className="space-y-6 animate-in slide-in-from-right-2 duration-500 delay-200" 
          aria-label="Insights and Coaching"
        >
          {/* Motivational Quotes */}
          <div className="sticky top-6">
            <Suspense fallback={<QuotesLoadingSkeleton />}>
              <LoadingWrapper
                loadingKey="quotes"
                className="min-h-[100px] rounded-lg"
                customLoader={<QuotesLoadingSkeleton />}
              >
                <MemoizedMotivationalQuotes />
              </LoadingWrapper>
            </Suspense>

            {/* AI Coach */}
            <div className="mt-6">
              <Suspense fallback={<AICoachLoadingSkeleton />}>
                <LoadingWrapper
                  loadingKey="ai-coach"
                  className="min-h-[480px] rounded-lg"
                  customLoader={<AICoachLoadingSkeleton />}
                >
                  <MemoizedAICoach />
                </LoadingWrapper>
              </Suspense>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
} 
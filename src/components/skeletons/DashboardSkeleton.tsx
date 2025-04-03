import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        {/* Welcome Message Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
            ))}
          </div>

          {/* Chart Skeleton */}
          <Skeleton className="h-[300px] w-full rounded-xl" />

          {/* Projects List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Skeleton } from './skeleton'

interface WithSkeletonProps {
  isLoading: boolean
  minHeight?: string
  children: React.ReactNode
  skeleton?: React.ReactNode
}

export function WithSkeleton({ 
  isLoading, 
  minHeight = 'min-h-[200px]',
  children,
  skeleton
}: WithSkeletonProps) {
  if (isLoading) {
    return (
      <div className={minHeight}>
        {skeleton || (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
} 
import React, { Suspense } from 'react'
import { Skeleton } from './skeleton'
import { useLoading } from '@/contexts/LoadingContext'

interface LoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  customLoader?: React.ReactNode
  loadingKey: string
  className?: string
}

export function LoadingWrapper({
  children,
  fallback,
  customLoader,
  loadingKey,
  className
}: LoadingWrapperProps) {
  const { setLoading } = useLoading()

  const defaultFallback = (
    <div className={className}>
      <Skeleton className="h-full w-full" />
    </div>
  )

  return (
    <Suspense
      fallback={
        <div className={className}>
          {customLoader || fallback || defaultFallback}
        </div>
      }
    >
      <LoadingBoundary
        loadingKey={loadingKey}
        setLoading={setLoading}
      >
        {children}
      </LoadingBoundary>
    </Suspense>
  )
}

interface LoadingBoundaryProps {
  children: React.ReactNode
  loadingKey: string
  setLoading: (key: string, loading: boolean) => void
}

function LoadingBoundary({
  children,
  loadingKey,
  setLoading
}: LoadingBoundaryProps) {
  React.useEffect(() => {
    setLoading(loadingKey, true)
    return () => setLoading(loadingKey, false)
  }, [loadingKey, setLoading])

  return <>{children}</>
} 
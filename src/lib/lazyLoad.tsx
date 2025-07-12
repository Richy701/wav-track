import React, { Suspense, lazy } from 'react'
import { Loading } from '@/components/ui/loading'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <Loading isLoading={true} />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

interface LazyLoadOptions {
  ssr?: boolean
  loading?: React.ComponentType
  minDelay?: number
}

export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    ssr = false,
    loading = LoadingSpinner,
    minDelay = 0
  } = options

  const LazyComponent = lazy(() => {
    if (minDelay > 0) {
      return Promise.all([
        importFn(),
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]).then(([moduleExport]) => moduleExport)
    }
    return importFn()
  })

  return function LazyLoadWrapper(props: React.ComponentProps<T>) {
    if (typeof window === 'undefined' && !ssr) {
      return null
    }

    return (
      <Suspense fallback={<loading />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Create feature bundles
export const TimerBundle = {
  Timer: lazyLoad(() => import('@/components/Timer')),
  TimerSettings: lazyLoad(() => import('@/components/timer/TimerSettings')),
  TimerDisplay: lazyLoad(() => import('@/components/timer/TimerDisplay')),
  TimerControls: lazyLoad(() => import('@/components/timer/TimerControls')),
}

export const MediaBundle = {
  LazyImage: lazyLoad(() => import('@/components/ui/lazy-image')),
  LazyVideo: lazyLoad(() => import('@/components/ui/lazy-video')),
  OptimizedImage: lazyLoad(() => import('@/components/OptimizedImage')),
}

export const FeatureBundle = {
  Stats: lazyLoad(() => import('@/components/Stats')),
  ProjectList: lazyLoad(() => import('@/components/ProjectList')),
  UserMenu: lazyLoad(() => import('@/components/UserMenu')),
}

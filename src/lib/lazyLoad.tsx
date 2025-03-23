import React, { Suspense } from 'react'
import { Loading } from '@/components/ui/loading'

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

// Helper function to create lazy-loaded components with consistent loading states
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  LoadingComponent: React.ComponentType = Loading
) {
  const LazyLoadedComponent = React.lazy(importFn)

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingComponent isLoading={true} />}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  )
}

// Create feature bundles
export const TimerBundle = {
  Timer: createLazyComponent(() => import('@/components/Timer')),
  TimerSettings: createLazyComponent(() => import('@/components/timer/TimerSettings')),
  TimerDisplay: createLazyComponent(() => import('@/components/timer/TimerDisplay')),
  TimerControls: createLazyComponent(() => import('@/components/timer/TimerControls')),
}

export const MediaBundle = {
  LazyImage: createLazyComponent(() => import('@/components/ui/lazy-image')),
  LazyVideo: createLazyComponent(() => import('@/components/ui/lazy-video')),
  OptimizedImage: createLazyComponent(() => import('@/components/OptimizedImage')),
}

export const FeatureBundle = {
  Stats: createLazyComponent(() => import('@/components/Stats')),
  ProjectList: createLazyComponent(() => import('@/components/ProjectList')),
  UserMenu: createLazyComponent(() => import('@/components/UserMenu')),
}

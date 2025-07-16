import { Suspense, memo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { lazyLoad } from '@/lib/lazyLoad'
import { cn } from '@/lib/utils'

// Lazy load non-critical components
const UserMenu = lazyLoad(() => import('@/components/UserMenu'), {
  loading: () => <LoadingSpinner size="sm" />
})

const ScrollToTop = lazyLoad(() => import('@/components/ScrollToTop').then(m => ({ default: m.ScrollToTop })), {
  loading: () => null
})

const OfflineStatus = lazyLoad(() => import('@/components/OfflineStatus'), {
  loading: () => null
})

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  containerWidth?: 'default' | 'narrow' | 'wide'
  withPadding?: boolean
  showHeader?: boolean
  showFooter?: boolean
}

const BaseLayoutInner = ({
  children,
  className,
  containerWidth = 'default',
  withPadding = true,
  showHeader = true,
  showFooter = true
}: BaseLayoutProps) => {
  const containerClasses = cn(
    'w-full mx-auto',
    {
      'max-w-7xl': containerWidth === 'default',
      'max-w-5xl': containerWidth === 'narrow',
      'max-w-full': containerWidth === 'wide',
      'px-4 sm:px-6 lg:px-8': withPadding
    },
    className
  )

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-background">
      {/* Subtle grid pattern overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:bg-[url('/grid-dark.svg')]" />
      
      {/* Content */}
      <div className="relative flex min-h-screen flex-col">
        {showHeader && (
          <Header />
        )}

        <main className={containerClasses}>
          {children}
        </main>

        {showFooter && (
          <Footer />
        )}

        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>

        <Suspense fallback={null}>
          <OfflineStatus />
        </Suspense>
      </div>
    </div>
  )
}

export const BaseLayout = memo(BaseLayoutInner)

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  containerWidth?: 'default' | 'narrow' | 'wide'
  withPadding?: boolean
}

export default function BaseLayout({
  children,
  className,
  containerWidth = 'default',
  withPadding = true,
}: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />

      <main
        className={cn(
          'flex-1 w-full mx-auto',
          withPadding && 'px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 lg:pb-16',
          containerWidth === 'narrow' && 'max-w-4xl',
          containerWidth === 'wide' && 'max-w-7xl',
          containerWidth === 'default' && 'max-w-6xl',
          className
        )}
      >
        {children}
      </main>

      <Footer />
    </div>
  )
}

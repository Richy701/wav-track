import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  poster?: string
  className?: string
  preload?: 'none' | 'metadata' | 'auto'
  threshold?: number
  rootMargin?: string
  mobileSrc?: string // Lower quality version for mobile
  tabletSrc?: string // Medium quality version for tablet
  desktopSrc?: string // High quality version for desktop
}

export function LazyVideo({
  src,
  poster,
  className,
  preload = 'none',
  threshold = 0.01,
  rootMargin = '50px',
  mobileSrc,
  tabletSrc,
  desktopSrc,
  ...props
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Determine the best video source based on device and available options
  useEffect(() => {
    let bestSrc = src // fallback to original src
    
    if (isMobile && mobileSrc) {
      bestSrc = mobileSrc
    } else if (isTablet && tabletSrc) {
      bestSrc = tabletSrc
    } else if (desktopSrc && !isMobile && !isTablet) {
      bestSrc = desktopSrc
    }
    
    setCurrentSrc(bestSrc)
  }, [src, mobileSrc, tabletSrc, desktopSrc, isMobile, isTablet])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold])

  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
    setError(false)
  }, [])

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true)
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setError(true)
    setIsLoading(false)
    // Fallback to original src if using optimized version fails
    if (currentSrc !== src) {
      setCurrentSrc(src)
    }
  }, [currentSrc, src])

  const handleCanPlay = useCallback(() => {
    // Preload a bit more data for smoother playback
    if (videoRef.current) {
      videoRef.current.preload = 'metadata'
    }
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Poster/Placeholder */}
      {poster && (!isLoaded || isLoading) && (
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-opacity duration-500',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white/90 dark:bg-zinc-900/90 rounded-full p-3 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-white"></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center p-4">
            <div className="text-red-600 dark:text-red-400 text-sm">
              Failed to load video
            </div>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        preload={preload}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onCanPlay={handleCanPlay}
        playsInline
        muted
        {...props}
      >
        {isInView && currentSrc && (
          <source src={currentSrc} type="video/mp4" />
        )}
      </video>
    </div>
  )
}

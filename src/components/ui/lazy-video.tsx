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
  mobileWebm?: string // WebM version for mobile
  tabletWebm?: string // WebM version for tablet
  desktopWebm?: string // WebM version for desktop
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
  mobileWebm,
  tabletWebm,
  desktopWebm,
  ...props
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [hasStartedLoading, setHasStartedLoading] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const [currentWebm, setCurrentWebm] = useState<string>('')
  const [userClickedPlay, setUserClickedPlay] = useState(false)
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
    let bestWebm = ''
    
    if (isMobile) {
      bestSrc = mobileSrc || src
      bestWebm = mobileWebm || ''
    } else if (isTablet) {
      bestSrc = tabletSrc || src
      bestWebm = tabletWebm || ''
    } else if (!isMobile && !isTablet) {
      bestSrc = desktopSrc || src
      bestWebm = desktopWebm || ''
    }
    
    setCurrentSrc(bestSrc)
    setCurrentWebm(bestWebm)
  }, [src, mobileSrc, tabletSrc, desktopSrc, mobileWebm, tabletWebm, desktopWebm, isMobile, isTablet])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          // Auto-load the video when it comes into view
          if (videoRef.current && !isLoaded) {
            videoRef.current.load()
          }
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before video comes into view
        threshold: 0.01,
      }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [isLoaded])

  const handleLoadStart = useCallback(() => {
    // Only show loading state if user clicked play
    if (userClickedPlay) {
      setHasStartedLoading(true)
      setIsLoading(true)
      setError(false)
    }
  }, [userClickedPlay])

  const handlePlayClick = useCallback(() => {
    setUserClickedPlay(true)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  const handleLoadedData = useCallback(() => {
    // Data is loaded but video might not be ready to play yet
    // We'll set loaded state in handleCanPlay instead
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
    // Video is ready to play
    setIsLoaded(true)
    setIsLoading(false)
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

      {/* Default placeholder when no poster and not loaded */}
      {!poster && !isLoaded && !hasStartedLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
          <div className="text-zinc-400 dark:text-zinc-500">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Play button overlay - shows on hover when video is not loaded and not in view */}
      {!isLoaded && !isInView && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors duration-200 group cursor-pointer"
          onClick={handlePlayClick}
        >
          <div className="bg-white/90 dark:bg-zinc-900/90 rounded-full p-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-8 h-8 text-zinc-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Brief loading indicator when user clicks play */}
      {userClickedPlay && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
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
        preload="metadata"
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onError={handleError}
        onCanPlay={handleCanPlay}
        playsInline
        muted
        {...props}
      >
        {isInView && currentWebm && (
          <source src={currentWebm} type="video/webm" />
        )}
        {isInView && currentSrc && (
          <source src={currentSrc} type="video/mp4" />
        )}
      </video>
    </div>
  )
}

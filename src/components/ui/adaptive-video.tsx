import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VideoSource {
  src: string
  type: string
  quality: 'mobile' | 'tablet' | 'desktop'
}

interface AdaptiveVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  sources: VideoSource[]
  poster?: string
  className?: string
  preload?: 'none' | 'metadata' | 'auto'
  threshold?: number
  rootMargin?: string
  fallbackSrc?: string
}

export function AdaptiveVideo({
  sources,
  poster,
  className,
  preload = 'none',
  threshold = 0.01,
  rootMargin = '50px',
  fallbackSrc,
  ...props
}: AdaptiveVideoProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [currentSource, setCurrentSource] = useState<VideoSource | null>(null)
  const [networkSpeed, setNetworkSpeed] = useState<'slow' | 'medium' | 'fast'>('medium')
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

  // Detect network speed
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const updateNetworkSpeed = () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setNetworkSpeed('slow')
        } else if (connection.effectiveType === '3g') {
          setNetworkSpeed('medium')
        } else {
          setNetworkSpeed('fast')
        }
      }
      
      updateNetworkSpeed()
      connection.addEventListener('change', updateNetworkSpeed)
      return () => connection.removeEventListener('change', updateNetworkSpeed)
    }
  }, [])

  // Select best video source
  useEffect(() => {
    if (!sources.length) return

    let bestSource = sources[0] // fallback to first source
    
    // Filter sources by device type
    const deviceSources = sources.filter(source => {
      if (isMobile) return source.quality === 'mobile'
      if (isTablet) return source.quality === 'tablet'
      return source.quality === 'desktop'
    })

    if (deviceSources.length > 0) {
      // Select based on network speed
      if (networkSpeed === 'slow') {
        // Prefer WebM for slow connections (better compression)
        const webmSource = deviceSources.find(s => s.type === 'video/webm')
        if (webmSource) {
          bestSource = webmSource
        } else {
          bestSource = deviceSources[0]
        }
      } else if (networkSpeed === 'medium') {
        // Prefer WebM for medium connections
        const webmSource = deviceSources.find(s => s.type === 'video/webm')
        if (webmSource) {
          bestSource = webmSource
        } else {
          bestSource = deviceSources[0]
        }
      } else {
        // Fast connection - prefer highest quality available
        bestSource = deviceSources[0]
      }
    }
    
    setCurrentSource(bestSource)
  }, [sources, isMobile, isTablet, networkSpeed])

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
    
    // Try fallback source if available
    if (fallbackSrc && currentSource?.src !== fallbackSrc) {
      setCurrentSource({
        src: fallbackSrc,
        type: 'video/mp4',
        quality: 'desktop'
      })
    }
  }, [fallbackSrc, currentSource])

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
        {isInView && currentSource && (
          <source src={currentSource.src} type={currentSource.type} />
        )}
      </video>
    </div>
  )
} 
import { useState, useEffect, useCallback, useRef } from 'react'

interface VideoPerformanceMetrics {
  loadTime: number
  firstFrameTime: number
  bufferingEvents: number
  totalBufferingTime: number
  quality: 'mobile' | 'tablet' | 'desktop'
  format: 'mp4' | 'webm'
  fileSize?: number
  networkSpeed?: 'slow' | 'medium' | 'fast'
}

interface UseVideoPerformanceOptions {
  onMetrics?: (metrics: VideoPerformanceMetrics) => void
  trackBuffering?: boolean
  trackNetworkSpeed?: boolean
}

export function useVideoPerformance(options: UseVideoPerformanceOptions = {}) {
  const [metrics, setMetrics] = useState<VideoPerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const startTime = useRef<number>(0)
  const bufferingStartTime = useRef<number>(0)
  const bufferingEvents = useRef<number>(0)
  const totalBufferingTime = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { onMetrics, trackBuffering = true, trackNetworkSpeed = true } = options

  // Detect network speed
  const getNetworkSpeed = useCallback((): 'slow' | 'medium' | 'fast' => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow'
      } else if (connection.effectiveType === '3g') {
        return 'medium'
      } else {
        return 'fast'
      }
    }
    return 'medium' // default assumption
  }, [])

  // Detect device quality
  const getDeviceQuality = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }, [])

  // Detect video format
  const getVideoFormat = useCallback((src: string): 'mp4' | 'webm' => {
    return src.includes('.webm') ? 'webm' : 'mp4'
  }, [])

  const startTracking = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video
    startTime.current = performance.now()
    bufferingEvents.current = 0
    totalBufferingTime.current = 0
    setIsLoading(true)
    setError(null)

    const handleLoadStart = () => {
      startTime.current = performance.now()
    }

    const handleLoadedData = () => {
      const loadTime = performance.now() - startTime.current
      const quality = getDeviceQuality()
      const format = getVideoFormat(video.src)
      const networkSpeed = trackNetworkSpeed ? getNetworkSpeed() : undefined

      const currentMetrics: VideoPerformanceMetrics = {
        loadTime,
        firstFrameTime: loadTime,
        bufferingEvents: bufferingEvents.current,
        totalBufferingTime: totalBufferingTime.current,
        quality,
        format,
        networkSpeed
      }

      setMetrics(currentMetrics)
      setIsLoading(false)
      
      if (onMetrics) {
        onMetrics(currentMetrics)
      }
    }

    const handleCanPlay = () => {
      const firstFrameTime = performance.now() - startTime.current
      if (metrics) {
        const updatedMetrics = { ...metrics, firstFrameTime }
        setMetrics(updatedMetrics)
        if (onMetrics) {
          onMetrics(updatedMetrics)
        }
      }
    }

    const handleWaiting = () => {
      if (trackBuffering) {
        bufferingStartTime.current = performance.now()
        bufferingEvents.current++
      }
    }

    const handleCanPlayThrough = () => {
      if (trackBuffering && bufferingStartTime.current > 0) {
        const bufferingTime = performance.now() - bufferingStartTime.current
        totalBufferingTime.current += bufferingTime
        bufferingStartTime.current = 0
      }
    }

    const handleError = () => {
      setError('Video failed to load')
      setIsLoading(false)
    }

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplaythrough', handleCanPlayThrough)
    video.addEventListener('error', handleError)

    // Return cleanup function
    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplaythrough', handleCanPlayThrough)
      video.removeEventListener('error', handleError)
    }
  }, [getDeviceQuality, getVideoFormat, getNetworkSpeed, trackBuffering, trackNetworkSpeed, onMetrics, metrics])

  const getPerformanceScore = useCallback((metrics: VideoPerformanceMetrics): number => {
    let score = 100

    // Deduct points for slow loading
    if (metrics.loadTime > 3000) score -= 20
    else if (metrics.loadTime > 2000) score -= 10
    else if (metrics.loadTime > 1000) score -= 5

    // Deduct points for buffering
    if (metrics.bufferingEvents > 3) score -= 15
    else if (metrics.bufferingEvents > 1) score -= 10
    else if (metrics.bufferingEvents > 0) score -= 5

    if (metrics.totalBufferingTime > 2000) score -= 15
    else if (metrics.totalBufferingTime > 1000) score -= 10
    else if (metrics.totalBufferingTime > 500) score -= 5

    // Bonus for optimal format
    if (metrics.format === 'webm') score += 5

    return Math.max(0, Math.min(100, score))
  }, [])

  const getPerformanceRecommendation = useCallback((metrics: VideoPerformanceMetrics): string => {
    const score = getPerformanceScore(metrics)
    
    if (score >= 90) {
      return 'Excellent performance!'
    } else if (score >= 75) {
      return 'Good performance, consider optimizing for slower networks.'
    } else if (score >= 60) {
      return 'Moderate performance, consider using lower quality videos for mobile.'
    } else {
      return 'Poor performance, implement aggressive optimization strategies.'
    }
  }, [getPerformanceScore])

  return {
    metrics,
    isLoading,
    error,
    startTracking,
    getPerformanceScore,
    getPerformanceRecommendation,
    reset: () => {
      setMetrics(null)
      setIsLoading(false)
      setError(null)
    }
  }
} 
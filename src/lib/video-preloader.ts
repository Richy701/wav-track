interface VideoPreloadOptions {
  quality?: 'low' | 'medium' | 'high'
  preloadAmount?: number // seconds to preload
  priority?: 'high' | 'low'
}

interface PreloadResult {
  success: boolean
  duration?: number
  size?: number
  error?: string
}

class VideoPreloader {
  private preloadedVideos = new Map<string, PreloadResult>()
  private preloadQueue: Array<{ src: string; options: VideoPreloadOptions }> = []
  private isProcessing = false

  /**
   * Preload a video with specified options
   */
  async preloadVideo(src: string, options: VideoPreloadOptions = {}): Promise<PreloadResult> {
    const { quality = 'medium', preloadAmount = 2, priority = 'low' } = options

    // Check if already preloaded
    if (this.preloadedVideos.has(src)) {
      return this.preloadedVideos.get(src)!
    }

    // Add to queue
    const queueItem = { src, options }
    if (priority === 'high') {
      this.preloadQueue.unshift(queueItem)
    } else {
      this.preloadQueue.push(queueItem)
    }

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue()
    }

    // Return a promise that resolves when preload is complete
    return new Promise((resolve) => {
      const checkComplete = () => {
        if (this.preloadedVideos.has(src)) {
          resolve(this.preloadedVideos.get(src)!)
        } else {
          setTimeout(checkComplete, 100)
        }
      }
      checkComplete()
    })
  }

  /**
   * Process the preload queue
   */
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const { src, options } = this.preloadQueue.shift()!
      
      try {
        const result = await this.preloadSingleVideo(src, options)
        this.preloadedVideos.set(src, result)
      } catch (error) {
        this.preloadedVideos.set(src, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.isProcessing = false
  }

  /**
   * Preload a single video
   */
  private async preloadSingleVideo(src: string, options: VideoPreloadOptions): Promise<PreloadResult> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true

      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        clearTimeout(timeoutId)
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        video.removeEventListener('canplay', onCanPlay)
        video.src = ''
        video.load()
      }

      const onLoadedMetadata = () => {
        clearTimeout(timeoutId)
        const result: PreloadResult = {
          success: true,
          duration: video.duration,
          size: 0 // We can't easily get file size without HEAD request
        }
        cleanup()
        resolve(result)
      }

      const onCanPlay = () => {
        clearTimeout(timeoutId)
        const result: PreloadResult = {
          success: true,
          duration: video.duration,
          size: 0
        }
        cleanup()
        resolve(result)
      }

      const onError = () => {
        clearTimeout(timeoutId)
        const result: PreloadResult = {
          success: false,
          error: 'Failed to load video'
        }
        cleanup()
        resolve(result)
      }

      // Set timeout
      timeoutId = setTimeout(() => {
        const result: PreloadResult = {
          success: false,
          error: 'Preload timeout'
        }
        cleanup()
        resolve(result)
      }, 10000) // 10 second timeout

      // Add event listeners
      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('canplay', onCanPlay)
      video.addEventListener('error', onError)

      // Start loading
      video.src = src
      video.load()
    })
  }

  /**
   * Preload multiple videos
   */
  async preloadVideos(sources: Array<{ src: string; options?: VideoPreloadOptions }>): Promise<PreloadResult[]> {
    const promises = sources.map(({ src, options }) => this.preloadVideo(src, options))
    return Promise.all(promises)
  }

  /**
   * Check if a video is preloaded
   */
  isPreloaded(src: string): boolean {
    return this.preloadedVideos.has(src) && this.preloadedVideos.get(src)!.success
  }

  /**
   * Get preload result for a video
   */
  getPreloadResult(src: string): PreloadResult | undefined {
    return this.preloadedVideos.get(src)
  }

  /**
   * Clear preloaded videos (useful for memory management)
   */
  clearPreloaded(): void {
    this.preloadedVideos.clear()
  }

  /**
   * Remove specific video from preloaded cache
   */
  removePreloaded(src: string): void {
    this.preloadedVideos.delete(src)
  }
}

// Create singleton instance
export const videoPreloader = new VideoPreloader()

/**
 * Hook for preloading videos in components
 */
export function useVideoPreloader() {
  return {
    preloadVideo: videoPreloader.preloadVideo.bind(videoPreloader),
    preloadVideos: videoPreloader.preloadVideos.bind(videoPreloader),
    isPreloaded: videoPreloader.isPreloaded.bind(videoPreloader),
    getPreloadResult: videoPreloader.getPreloadResult.bind(videoPreloader),
    clearPreloaded: videoPreloader.clearPreloaded.bind(videoPreloader),
    removePreloaded: videoPreloader.removePreloaded.bind(videoPreloader)
  }
}

/**
 * Preload videos for a specific feature
 */
export function preloadFeatureVideos(featureVideos: Array<{ src: string; type: string; quality: string }>) {
  // Preload mobile versions first (most important for performance)
  const mobileVideos = featureVideos.filter(v => v.quality === 'mobile')
  const tabletVideos = featureVideos.filter(v => v.quality === 'tablet')
  const desktopVideos = featureVideos.filter(v => v.quality === 'desktop')

  // Preload in priority order
  const preloadOrder = [
    ...mobileVideos.map(v => ({ src: v.src, options: { priority: 'high' as const } })),
    ...tabletVideos.map(v => ({ src: v.src, options: { priority: 'medium' as const } })),
    ...desktopVideos.map(v => ({ src: v.src, options: { priority: 'low' as const } }))
  ]

  return videoPreloader.preloadVideos(preloadOrder)
} 
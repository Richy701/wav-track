import { useState, useEffect, useRef } from 'react'

// Cache size limit in MB
const CACHE_SIZE_LIMIT = 50 * 1024 * 1024 // 50MB
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// In-memory LRU cache
const memoryCache: {
  [key: string]: {
    data: string
    timestamp: number
    size: number
  }
} = {}

let currentCacheSize = 0

function cleanupCache() {
  const now = Date.now()
  Object.entries(memoryCache).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_EXPIRY) {
      currentCacheSize -= value.size
      delete memoryCache[key]
    }
  })
}

export function useImageCache(imageUrl: string | null | undefined) {
  const [cachedImage, setCachedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const maxRetries = 3

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false)
      return
    }

    // Reset state
    setError(false)
    setIsLoading(true)
    retryCountRef.current = 0

    // Check memory cache first
    if (memoryCache[imageUrl]) {
      setCachedImage(memoryCache[imageUrl].data)
      setIsLoading(false)
      // Update timestamp to mark as recently used
      memoryCache[imageUrl].timestamp = Date.now()
      return
    }

    const loadImage = async () => {
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error('Failed to fetch image')
        
        const blob = await response.blob()
        const imageSize = blob.size

        // Clean up old cache entries if needed
        if (currentCacheSize + imageSize > CACHE_SIZE_LIMIT) {
          cleanupCache()
          
          // If still over limit, remove oldest entries
          const entries = Object.entries(memoryCache)
            .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          
          while (currentCacheSize + imageSize > CACHE_SIZE_LIMIT && entries.length) {
            const [key, value] = entries.shift()!
            currentCacheSize -= value.size
            delete memoryCache[key]
          }
        }

        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result as string
          
          // Update cache
          memoryCache[imageUrl] = {
            data: base64data,
            timestamp: Date.now(),
            size: imageSize
          }
          currentCacheSize += imageSize
          
          setCachedImage(base64data)
          setIsLoading(false)
        }
        
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error('Error loading image:', error)
        setError(true)
        setIsLoading(false)
        
        // Implement exponential backoff retry
        if (retryCountRef.current < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000)
          retryTimeoutRef.current = setTimeout(() => {
            retryCountRef.current++
            setError(false)
            setIsLoading(true)
          }, delay)
        }
      }
    }

    loadImage()

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [imageUrl])

  return {
    cachedImage,
    isLoading,
    error
  }
} 
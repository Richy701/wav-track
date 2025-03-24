import { useState, useEffect, useRef } from 'react'

interface ImageCache {
  [key: string]: {
    data: string
    timestamp: number
  }
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const memoryCache: ImageCache = {}

export function useImageCache(imageUrl: string | null | undefined) {
  const [cachedImage, setCachedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)
  const maxRetries = 3

  useEffect(() => {
    const loadImage = async () => {
      if (!imageUrl) {
        setIsLoading(false)
        return
      }

      // Check memory cache first
      if (memoryCache[imageUrl] && Date.now() - memoryCache[imageUrl].timestamp < CACHE_DURATION) {
        setCachedImage(memoryCache[imageUrl].data)
        setIsLoading(false)
        return
      }

      // Check localStorage
      try {
        const cached = localStorage.getItem(`image_cache_${imageUrl}`)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            setCachedImage(data)
            memoryCache[imageUrl] = { data, timestamp }
            setIsLoading(false)
            return
          }
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error)
      }

      // Fetch and cache the image
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) throw new Error('Failed to fetch image')
        
        const blob = await response.blob()
        const reader = new FileReader()
        
        reader.onloadend = () => {
          const base64data = reader.result as string
          setCachedImage(base64data)
          
          // Update memory cache
          memoryCache[imageUrl] = {
            data: base64data,
            timestamp: Date.now()
          }
          
          // Update localStorage
          try {
            localStorage.setItem(
              `image_cache_${imageUrl}`,
              JSON.stringify({
                data: base64data,
                timestamp: Date.now()
              })
            )
          } catch (error) {
            console.error('Error writing to localStorage:', error)
          }
          
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
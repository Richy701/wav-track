import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { imageOptimization } from '@/lib/animations'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    // Preload image if priority is true
    if (priority) {
      const img = new Image()
      img.src = src
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setIsError(true)
    }
  }, [src, priority])

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="absolute inset-0 bg-gray-200 dark:bg-gray-800"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Main image */}
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'w-full h-full object-cover',
          !isLoaded && 'opacity-0'
        )}
        variants={imageVariants}
        initial="hidden"
        animate="visible"
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <span className="text-gray-500 dark:text-gray-400">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

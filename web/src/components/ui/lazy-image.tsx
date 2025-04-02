import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  blurHash?: string
  className?: string
  placeholderClassName?: string
}

export function LazyImage({
  src,
  alt,
  blurHash,
  className,
  placeholderClassName,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder/Blur */}
      <div
        className={cn(
          'absolute inset-0 transform scale-110 filter blur-xl transition-opacity duration-500',
          isLoaded ? 'opacity-0' : 'opacity-100',
          placeholderClassName
        )}
        style={{
          backgroundColor: '#f0f0f0',
          backgroundImage: blurHash ? `url(${blurHash})` : undefined,
        }}
      />

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  )
}

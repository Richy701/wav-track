import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  className?: string;
  preload?: 'none' | 'metadata' | 'auto';
  threshold?: number;
  rootMargin?: string;
}

export function LazyVideo({
  src,
  poster,
  className,
  preload = 'none',
  threshold = 0.01,
  rootMargin = '50px',
  ...props
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Poster/Placeholder */}
      {poster && !isLoaded && (
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* Video */}
      <video
        ref={videoRef}
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        preload={preload}
        onLoadedData={handleLoadedData}
        {...props}
      >
        {isInView && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
} 
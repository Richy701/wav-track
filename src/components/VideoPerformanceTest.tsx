import React, { useState } from 'react'
import { AdaptiveVideo } from '@/components/ui/adaptive-video'
import { useVideoPerformance } from '@/hooks/useVideoPerformance'
import { preloadFeatureVideos } from '@/lib/video-preloader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const testVideos = [
  {
    name: 'Analytics Demo',
    sources: [
      { src: '/videos/optimized/mobile/analytic-mobile.mp4', type: 'video/mp4', quality: 'mobile' },
      { src: '/videos/optimized/mobile/analytic-mobile.webm', type: 'video/webm', quality: 'mobile' },
      { src: '/videos/optimized/tablet/analytic-tablet.mp4', type: 'video/mp4', quality: 'tablet' },
      { src: '/videos/optimized/tablet/analytic-tablet.webm', type: 'video/webm', quality: 'tablet' },
      { src: '/videos/optimized/desktop/analytic-desktop.mp4', type: 'video/mp4', quality: 'desktop' },
      { src: '/videos/optimized/desktop/analytic-desktop.webm', type: 'video/webm', quality: 'desktop' }
    ],
    poster: '/images/features/wavtrack-screengrabs/workflow-preview.png'
  },
  {
    name: 'Pomodoro Timer',
    sources: [
      { src: '/videos/optimized/mobile/pomodoro-mobile.mp4', type: 'video/mp4', quality: 'mobile' },
      { src: '/videos/optimized/mobile/pomodoro-mobile.webm', type: 'video/webm', quality: 'mobile' },
      { src: '/videos/optimized/tablet/pomodoro-tablet.mp4', type: 'video/mp4', quality: 'tablet' },
      { src: '/videos/optimized/tablet/pomodoro-tablet.webm', type: 'video/webm', quality: 'tablet' },
      { src: '/videos/optimized/desktop/pomodoro-desktop.mp4', type: 'video/mp4', quality: 'desktop' },
      { src: '/videos/optimized/desktop/pomodoro-desktop.webm', type: 'video/webm', quality: 'desktop' }
    ],
    poster: '/images/features/wavtrack-screengrabs/goals-preview.png'
  },
  {
    name: 'Project Management',
    sources: [
      { src: '/videos/optimized/mobile/project-mobile.mp4', type: 'video/mp4', quality: 'mobile' },
      { src: '/videos/optimized/mobile/project-mobile.webm', type: 'video/webm', quality: 'mobile' },
      { src: '/videos/optimized/tablet/project-tablet.mp4', type: 'video/mp4', quality: 'tablet' },
      { src: '/videos/optimized/tablet/project-tablet.webm', type: 'video/webm', quality: 'tablet' },
      { src: '/videos/optimized/desktop/project-desktop.mp4', type: 'video/mp4', quality: 'desktop' },
      { src: '/videos/optimized/desktop/project-desktop.webm', type: 'video/webm', quality: 'desktop' }
    ],
    poster: '/images/features/wavtrack-screengrabs/achievements-preview.png'
  }
]

export function VideoPerformanceTest() {
  const [selectedVideo, setSelectedVideo] = useState(0)
  const [isPreloading, setIsPreloading] = useState(false)
  const [preloadComplete, setPreloadComplete] = useState(false)
  
  const { metrics, startTracking, getPerformanceScore, getPerformanceRecommendation } = useVideoPerformance({
    onMetrics: (metrics) => {
      console.log('Video Performance Metrics:', metrics)
    }
  })

  const handlePreload = async () => {
    setIsPreloading(true)
    try {
      await preloadFeatureVideos(testVideos[selectedVideo].sources)
      setPreloadComplete(true)
    } catch (error) {
      console.error('Preload failed:', error)
    } finally {
      setIsPreloading(false)
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 75) return 'bg-yellow-500'
    if (score >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Video Performance Test</h1>
        <p className="text-muted-foreground">
          Test the optimized video loading performance across different devices and network conditions
        </p>
      </div>

      {/* Video Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Video to Test</CardTitle>
          <CardDescription>
            Choose a video to test the adaptive loading system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {testVideos.map((video, index) => (
              <Button
                key={index}
                variant={selectedVideo === index ? 'default' : 'outline'}
                onClick={() => setSelectedVideo(index)}
              >
                {video.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preload Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Preload Controls</CardTitle>
          <CardDescription>
            Preload videos for better performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={handlePreload} 
              disabled={isPreloading}
            >
              {isPreloading ? 'Preloading...' : 'Preload Videos'}
            </Button>
            {preloadComplete && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Preload Complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      <Card>
        <CardHeader>
          <CardTitle>Adaptive Video Player</CardTitle>
          <CardDescription>
            This video automatically selects the best quality based on your device and network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <AdaptiveVideo
              sources={testVideos[selectedVideo].sources}
              poster={testVideos[selectedVideo].poster}
              className="w-full h-full object-cover"
              controls
              muted
              loop
              playsInline
              preload="none"
              onLoadStart={(e) => {
                const video = e.target as HTMLVideoElement
                startTracking(video)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Real-time performance data for the current video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(metrics.loadTime)}ms</div>
                <div className="text-sm text-muted-foreground">Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.bufferingEvents}</div>
                <div className="text-sm text-muted-foreground">Buffering Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.quality}</div>
                <div className="text-sm text-muted-foreground">Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.format}</div>
                <div className="text-sm text-muted-foreground">Format</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Performance Score</span>
                <Badge className={getPerformanceColor(getPerformanceScore(metrics))}>
                  {getPerformanceScore(metrics)}/100
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getPerformanceRecommendation(metrics)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Summary</CardTitle>
          <CardDescription>
            What we've improved for better mobile performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">File Size Reduction</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Original: 11-17MB per video</li>
                <li>• Mobile: ~1MB (90% smaller)</li>
                <li>• Tablet: ~1MB (90% smaller)</li>
                <li>• Desktop: ~3MB (80% smaller)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Performance Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Adaptive quality selection</li>
                <li>• WebM format support</li>
                <li>• Lazy loading</li>
                <li>• Network-aware preloading</li>
                <li>• Device detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
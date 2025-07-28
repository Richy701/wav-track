import { Track } from '@/types/track'
import { WithSkeleton } from './ui/with-skeleton'
import { Skeleton } from './ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { fetchTrackDetails } from '@/lib/api'
import { AudioAnalyzer } from './audio/AudioAnalyzer'
import { AudioAnalysisDisplay } from './audio/AudioAnalysisDisplay'
import { useState } from 'react'

interface TrackDetailsProps {
  track: Track | null
}

export function TrackDetails({ track }: TrackDetailsProps) {
  const [analysis, setAnalysis] = useState<{
    bpm: number
    key: string
    mood: string
    energy: number
    danceability: number
  } | null>(null)

  const { data: trackDetails, isLoading } = useQuery({
    queryKey: ['track', track?.id],
    queryFn: () => track ? fetchTrackDetails(track.id) : null,
    enabled: !!track,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const customSkeleton = (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-6">
        <Skeleton className="h-32 w-32 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )

  return (
    <WithSkeleton 
      isLoading={isLoading}
      minHeight="min-h-[300px]"
      skeleton={customSkeleton}
    >
      {trackDetails && (
        <div className="space-y-6 p-6">
          <div className="flex items-center space-x-6">
            <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Music2 className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{trackDetails.title}</h2>
              <div className="inline-flex items-baseline space-x-2 mt-1">
                <span className="text-muted-foreground text-base leading-none">
                  @{trackDetails.artist}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{trackDetails.description}</p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Duration: {trackDetails.duration}
              </span>
              <span className="text-sm text-muted-foreground">
                Genre: {trackDetails.genre}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Audio Analysis</h3>
            {analysis ? (
              <AudioAnalysisDisplay
                bpm={analysis.bpm}
                key={analysis.key}
                mood={analysis.mood}
                energy={analysis.energy}
                danceability={analysis.danceability}
              />
            ) : (
              <AudioAnalyzer onAnalysisComplete={setAnalysis} />
            )}
          </div>
        </div>
      )}
    </WithSkeleton>
  )
} 
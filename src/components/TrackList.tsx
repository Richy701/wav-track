import { Track } from '@/types/track'
import { WithSkeleton } from './ui/with-skeleton'
import { Skeleton } from './ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { fetchTracks } from '@/lib/api'

interface TrackListProps {
  onTrackSelect: (track: Track) => void
}

export function TrackList({ onTrackSelect }: TrackListProps) {
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const customSkeleton = (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-card">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <WithSkeleton 
      isLoading={isLoading}
      minHeight="min-h-[400px]"
      skeleton={customSkeleton}
    >
      <div className="space-y-4">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => onTrackSelect(track)}
            className="w-full flex items-center space-x-4 p-4 rounded-lg bg-card hover:bg-accent transition-colors"
          >
            <img
              src={track.coverArt}
              alt={track.title}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <h3 className="font-medium">{track.title}</h3>
              <p className="text-sm text-muted-foreground">{track.artist}</p>
            </div>
          </button>
        ))}
      </div>
    </WithSkeleton>
  )
} 
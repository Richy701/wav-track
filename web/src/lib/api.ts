import { Track } from '@/types/track'

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulated track data
const tracks: Track[] = [
  {
    id: '1',
    title: 'Sample Track 1',
    artist: 'Artist 1',
    coverArt: 'https://picsum.photos/200',
    duration: '3:45',
    genre: 'Pop',
    description: 'A sample track description'
  },
  {
    id: '2',
    title: 'Sample Track 2',
    artist: 'Artist 2',
    coverArt: 'https://picsum.photos/201',
    duration: '4:20',
    genre: 'Rock',
    description: 'Another sample track description'
  }
]

export async function fetchTracks(): Promise<Track[]> {
  await delay(1000) // Simulate network delay
  return tracks
}

export async function fetchTrackDetails(trackId: string): Promise<Track> {
  await delay(500) // Simulate network delay
  const track = tracks.find(t => t.id === trackId)
  if (!track) {
    throw new Error('Track not found')
  }
  return track
} 
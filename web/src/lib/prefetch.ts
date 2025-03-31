import { QueryClient } from '@tanstack/react-query'
import { fetchTracks } from './api'

export async function prefetchDashboardData(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  })
} 
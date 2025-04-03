import { QueryClient } from '@tanstack/react-query'
import { fetchTracks } from './api'

export async function prefetchDashboardData(queryClient: QueryClient) {
  try {
    console.log('[Debug] Starting dashboard data prefetch')
    await queryClient.prefetchQuery({
      queryKey: ['tracks'],
      queryFn: fetchTracks,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      onError: (error) => {
        console.error('[Debug] Error prefetching dashboard data:', error)
      }
    })
    console.log('[Debug] Dashboard data prefetch completed')
  } catch (error) {
    console.error('[Debug] Failed to prefetch dashboard data:', error)
    // Don't throw the error - we want the login to continue even if prefetch fails
  }
} 
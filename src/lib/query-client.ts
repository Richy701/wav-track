import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on certain errors
        if (error?.status === 404 || error?.status === 403) {
          return false
        }
        return failureCount < 2 // Max 2 retries instead of 1
      },
      refetchOnMount: false, // Optimized: don't refetch on mount
      refetchOnReconnect: true, // Do refetch on reconnect for fresh data
      refetchInterval: false,
      suspense: false, // CRITICAL FIX: Remove suspense to prevent cascading loading states
      throwOnError: false, // Handle errors gracefully instead of throwing
      // Add network mode for better offline handling
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 1 // Max 1 retry for mutations
      },
      throwOnError: false, // Handle mutation errors gracefully
      // Add network mode for mutations
      networkMode: 'online',
    },
  },
  // Add global error handler
  defaultQueryOptions: {
    retry: false, // Global override for specific queries that shouldn't retry
  },
}) 
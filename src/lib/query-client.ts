import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      suspense: true,
      throwOnError: true, // renamed from useErrorBoundary in v5
    },
    mutations: {
      retry: 1,
      throwOnError: true, // renamed from useErrorBoundary in v5
    },
  },
}) 
import { QueryClient } from '@tanstack/react-query'
import { getAccessToken, subscribeAccessToken } from './auth-token'
import { ApiError } from './http'

/** Списки витрины почти статичны. auth/me этот объект не используют. */
export const catalogQueryDefaults = {
  staleTime: 5 * 60_000,
  refetchOnWindowFocus: false,
} as const

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.statusCode < 500) {
          return false
        }
        return failureCount < 1
      },
    },
    mutations: {
      retry: 0,
    },
  },
})

subscribeAccessToken(() => {
  if (!getAccessToken()) {
    queryClient.removeQueries({ queryKey: ['auth'] })
  }
})

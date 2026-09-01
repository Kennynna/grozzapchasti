import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'

export type QueryViewStatus = 'loading' | 'error' | 'empty' | 'success'

export function getQueryViewStatus<T>(
  query: Pick<UseQueryResult<T>, 'data' | 'isPending' | 'isError'>,
  isEmpty?: (data: T) => boolean,
): QueryViewStatus {
  if (query.isPending) {
    return 'loading'
  }
  if (query.isError) {
    return 'error'
  }
  if (query.data === undefined || isEmpty?.(query.data)) {
    return 'empty'
  }
  return 'success'
}

export function getQueryFlags<T>(
  query: Pick<UseQueryResult<T>, 'isPending' | 'isFetching' | 'isStale'>,
) {
  return {
    isBackgroundRefetch: query.isFetching && !query.isPending,
    isStale: query.isStale,
  }
}

export type MutationViewStatus = 'idle' | 'loading' | 'error' | 'success'

export function getMutationViewStatus(
  mutation: Pick<UseMutationResult, 'isPending' | 'isError' | 'isSuccess'>,
): MutationViewStatus {
  if (mutation.isPending) {
    return 'loading'
  }
  if (mutation.isError) {
    return 'error'
  }
  if (mutation.isSuccess) {
    return 'success'
  }
  return 'idle'
}

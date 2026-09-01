import type { QueryClient, QueryKey } from '@tanstack/react-query'

export type QuerySnapshots<T> = Array<[QueryKey, T | undefined]>

export async function cancelAndSnapshot<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): Promise<QuerySnapshots<T>> {
  await queryClient.cancelQueries({ queryKey })
  return queryClient.getQueriesData<T>({ queryKey })
}

export function restoreSnapshots<T>(
  queryClient: QueryClient,
  snapshots: QuerySnapshots<T> | undefined,
) {
  if (!snapshots) {
    return
  }
  for (const [queryKey, data] of snapshots) {
    queryClient.setQueryData(queryKey, data)
  }
}

export function mapListQueries<T extends { id: number }>(
  queryClient: QueryClient,
  listKey: QueryKey,
  mapper: (items: T[]) => T[],
) {
  queryClient.setQueriesData<T[]>({ queryKey: listKey }, (current) =>
    current ? mapper(current) : current,
  )
}

export function prependListItem<T extends { id: number }>(
  queryClient: QueryClient,
  listKey: QueryKey,
  item: T,
) {
  queryClient.setQueryData<T[]>(listKey, (current) => {
    if (!current) {
      return current
    }
    if (current.some((entry) => entry.id === item.id)) {
      return current
    }
    return [item, ...current]
  })
}

export function patchListItem<T extends { id: number }>(
  queryClient: QueryClient,
  listKey: QueryKey,
  id: number,
  patch: Partial<T>,
) {
  mapListQueries<T>(queryClient, listKey, (items) =>
    items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  )
}

export function removeListItem<T extends { id: number }>(
  queryClient: QueryClient,
  listKey: QueryKey,
  id: number,
) {
  mapListQueries<T>(queryClient, listKey, (items) =>
    items.filter((item) => item.id !== id),
  )
}

export function withoutImages<T extends { images?: File[] }>(input: T): Omit<T, 'images'> {
  const fields = { ...input }
  delete fields.images
  return fields
}

export function definedPatch<T extends object>(input: T): Partial<T> {
  const patch: Partial<T> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      patch[key as keyof T] = value as T[keyof T]
    }
  }
  return patch
}

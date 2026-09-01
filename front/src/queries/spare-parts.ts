import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  cancelAndSnapshot,
  definedPatch,
  mapListQueries,
  patchListItem,
  prependListItem,
  removeListItem,
  restoreSnapshots,
  withoutImages,
} from './cache'
import { apiRequest } from './http'
import { catalogQueryDefaults, queryClient as appQueryClient } from './query-client'
import type {
  SparePart,
  SparePartWriteInput,
  SparePartsListFilters,
} from './types'
import { imageFilename } from './types'

export const sparePartsKeys = {
  all: ['spare-parts'] as const,
  lists: () => [...sparePartsKeys.all, 'list'] as const,
  list: (filters: SparePartsListFilters = {}) =>
    [...sparePartsKeys.lists(), filters] as const,
  details: () => [...sparePartsKeys.all, 'detail'] as const,
  detail: (id: number) => [...sparePartsKeys.details(), id] as const,
}

export async function getSpareParts(filters: SparePartsListFilters = {}) {
  return apiRequest<SparePart[]>('/spare-parts', {
    query: {
      markId: filters.markId,
      modelId: filters.modelId,
      categoryId: filters.categoryId,
    },
  })
}

export async function getSparePart(id: number) {
  return apiRequest<SparePart>(`/spare-parts/${id}`)
}

export async function createSparePart(
  input: {
    name: string
    price: number
    categoryId: number
    markId?: number | null
    modelId?: number | null
  } & SparePartWriteInput,
) {
  return apiRequest<SparePart>('/spare-parts', {
    method: 'POST',
    json: {
      name: input.name,
      price: input.price,
      markId: input.markId,
      modelId: input.modelId,
      categoryId: input.categoryId,
      article: input.article,
      description: input.description,
    },
    files: input.images,
  })
}

export async function updateSparePart(id: number, input: SparePartWriteInput) {
  return apiRequest<SparePart>(`/spare-parts/${id}`, {
    method: 'PATCH',
    json: {
      name: input.name,
      price: input.price,
      markId: input.markId,
      modelId: input.modelId,
      categoryId: input.categoryId,
      article: input.article,
      description: input.description,
    },
    files: input.images,
  })
}

export async function deleteSparePart(id: number) {
  return apiRequest<SparePart>(`/spare-parts/${id}`, { method: 'DELETE' })
}

export async function deleteSparePartImage(id: number, filename: string) {
  return apiRequest<SparePart>(
    `/spare-parts/${id}/images/${encodeURIComponent(filename)}`,
    { method: 'DELETE' },
  )
}

export const sparePartsQueries = {
  list: (filters: SparePartsListFilters = {}) =>
    queryOptions({
      queryKey: sparePartsKeys.list(filters),
      queryFn: () => getSpareParts(filters),
      placeholderData: keepPreviousData,
      ...catalogQueryDefaults,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: sparePartsKeys.detail(id),
      queryFn: () => getSparePart(id),
      ...catalogQueryDefaults,
      placeholderData: () => {
        const lists = appQueryClient.getQueriesData<SparePart[]>({
          queryKey: sparePartsKeys.lists(),
        })
        for (const [, items] of lists) {
          const found = items?.find((item) => item.id === id)
          if (found) {
            return found
          }
        }
        return undefined
      },
    }),
}

export function useSparePartsQuery(
  filters: SparePartsListFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    ...sparePartsQueries.list(filters),
    enabled: options?.enabled ?? true,
  })
}

export function useSparePartQuery(id: number) {
  return useQuery({
    ...sparePartsQueries.detail(id),
    enabled: id > 0,
  })
}

export function useCreateSparePartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSparePart,
    onSuccess: (part) => {
      queryClient.setQueryData(sparePartsKeys.detail(part.id), part)
      prependListItem(queryClient, sparePartsKeys.list(), part)
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: sparePartsKeys.lists() }),
  })
}

export function useUpdateSparePartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & SparePartWriteInput) =>
      updateSparePart(id, input),
    onMutate: async ({ id, ...input }) => {
      const patch = definedPatch(withoutImages(input))
      const lists = await cancelAndSnapshot<SparePart[]>(
        queryClient,
        sparePartsKeys.lists(),
      )
      const details = await cancelAndSnapshot<SparePart>(
        queryClient,
        sparePartsKeys.detail(id),
      )
      patchListItem<SparePart>(queryClient, sparePartsKeys.lists(), id, patch)
      queryClient.setQueryData<SparePart>(sparePartsKeys.detail(id), (current) =>
        current ? { ...current, ...patch } : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (part) => {
      queryClient.setQueryData(sparePartsKeys.detail(part.id), part)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: sparePartsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: sparePartsKeys.detail(id) }),
      ]),
  })
}

export function useDeleteSparePartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSparePart,
    onMutate: async (id) => {
      const lists = await cancelAndSnapshot<SparePart[]>(
        queryClient,
        sparePartsKeys.lists(),
      )
      removeListItem<SparePart>(queryClient, sparePartsKeys.lists(), id)
      queryClient.removeQueries({ queryKey: sparePartsKeys.detail(id) })
      return { lists }
    },
    onError: (_error, _id, context) => {
      restoreSnapshots(queryClient, context?.lists)
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: sparePartsKeys.all }),
  })
}

export function useDeleteSparePartImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) =>
      deleteSparePartImage(id, filename),
    onMutate: async ({ id, filename }) => {
      const lists = await cancelAndSnapshot<SparePart[]>(
        queryClient,
        sparePartsKeys.lists(),
      )
      const details = await cancelAndSnapshot<SparePart>(
        queryClient,
        sparePartsKeys.detail(id),
      )
      const strip = (item: SparePart) => ({
        ...item,
        images: item.images.filter((path) => imageFilename(path) !== filename),
      })
      mapListQueries<SparePart>(queryClient, sparePartsKeys.lists(), (items) =>
        items.map((item) => (item.id === id ? strip(item) : item)),
      )
      queryClient.setQueryData<SparePart>(sparePartsKeys.detail(id), (current) =>
        current ? strip(current) : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (part) => {
      queryClient.setQueryData(sparePartsKeys.detail(part.id), part)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: sparePartsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: sparePartsKeys.detail(id) }),
      ]),
  })
}

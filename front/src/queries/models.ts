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
import { sparePartsKeys } from './spare-parts'
import type { Model, ModelsListFilters, ModelWriteInput, SparePart } from './types'
import { imageFilename } from './types'

export const modelsKeys = {
  all: ['models'] as const,
  lists: () => [...modelsKeys.all, 'list'] as const,
  list: (filters: ModelsListFilters = {}) =>
    [...modelsKeys.lists(), filters] as const,
  details: () => [...modelsKeys.all, 'detail'] as const,
  detail: (id: number) => [...modelsKeys.details(), id] as const,
}

export async function getModels(filters: ModelsListFilters = {}) {
  return apiRequest<Model[]>('/models', {
    query: { markId: filters.markId },
  })
}

export async function getModel(id: number) {
  return apiRequest<Model>(`/models/${id}`)
}

export async function createModel(
  input: { name: string; markId: number } & ModelWriteInput,
) {
  return apiRequest<Model>('/models', {
    method: 'POST',
    json: {
      name: input.name,
      markId: input.markId,
      description: input.description,
    },
    files: input.images,
  })
}

export async function updateModel(id: number, input: ModelWriteInput) {
  return apiRequest<Model>(`/models/${id}`, {
    method: 'PATCH',
    json: {
      name: input.name,
      markId: input.markId,
      description: input.description,
    },
    files: input.images,
  })
}

export async function deleteModel(id: number) {
  return apiRequest<Model>(`/models/${id}`, { method: 'DELETE' })
}

export async function deleteModelImage(id: number, filename: string) {
  return apiRequest<Model>(
    `/models/${id}/images/${encodeURIComponent(filename)}`,
    { method: 'DELETE' },
  )
}

export const modelsQueries = {
  list: (filters: ModelsListFilters = {}) =>
    queryOptions({
      queryKey: modelsKeys.list(filters),
      queryFn: () => getModels(filters),
      placeholderData: keepPreviousData,
      ...catalogQueryDefaults,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: modelsKeys.detail(id),
      queryFn: () => getModel(id),
      ...catalogQueryDefaults,
      placeholderData: () => {
        const lists = appQueryClient.getQueriesData<Model[]>({
          queryKey: modelsKeys.lists(),
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

export function useModelsQuery(filters: ModelsListFilters = {}) {
  return useQuery(modelsQueries.list(filters))
}

export function useModelQuery(id: number) {
  return useQuery({
    ...modelsQueries.detail(id),
    enabled: id > 0,
  })
}

export function useCreateModelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createModel,
    onSuccess: (model) => {
      queryClient.setQueryData(modelsKeys.detail(model.id), model)
      prependListItem(queryClient, modelsKeys.list(), model)
      prependListItem(queryClient, modelsKeys.list({ markId: model.markId }), model)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: modelsKeys.lists() }),
  })
}

export function useUpdateModelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & ModelWriteInput) =>
      updateModel(id, input),
    onMutate: async ({ id, ...input }) => {
      const patch = definedPatch(withoutImages(input))
      const lists = await cancelAndSnapshot<Model[]>(queryClient, modelsKeys.lists())
      const details = await cancelAndSnapshot<Model>(queryClient, modelsKeys.detail(id))
      patchListItem<Model>(queryClient, modelsKeys.lists(), id, patch)
      queryClient.setQueryData<Model>(modelsKeys.detail(id), (current) =>
        current ? { ...current, ...patch } : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (model) => {
      queryClient.setQueryData(modelsKeys.detail(model.id), model)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: modelsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: modelsKeys.detail(id) }),
      ]),
  })
}

export function useDeleteModelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteModel,
    onMutate: async (id) => {
      const models = await cancelAndSnapshot<Model[]>(queryClient, modelsKeys.lists())
      const parts = await cancelAndSnapshot<SparePart[]>(
        queryClient,
        sparePartsKeys.lists(),
      )
      removeListItem<Model>(queryClient, modelsKeys.lists(), id)
      mapListQueries<SparePart>(queryClient, sparePartsKeys.lists(), (items) =>
        items.filter((item) => item.modelId !== id),
      )
      queryClient.removeQueries({ queryKey: modelsKeys.detail(id) })
      return { models, parts }
    },
    onError: (_error, _id, context) => {
      restoreSnapshots(queryClient, context?.models)
      restoreSnapshots(queryClient, context?.parts)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: modelsKeys.all }),
        queryClient.invalidateQueries({ queryKey: sparePartsKeys.all }),
      ]),
  })
}

export function useDeleteModelImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) =>
      deleteModelImage(id, filename),
    onMutate: async ({ id, filename }) => {
      const lists = await cancelAndSnapshot<Model[]>(queryClient, modelsKeys.lists())
      const details = await cancelAndSnapshot<Model>(
        queryClient,
        modelsKeys.detail(id),
      )
      const strip = (item: Model) => ({
        ...item,
        images: item.images.filter((path) => imageFilename(path) !== filename),
      })
      mapListQueries<Model>(queryClient, modelsKeys.lists(), (items) =>
        items.map((item) => (item.id === id ? strip(item) : item)),
      )
      queryClient.setQueryData<Model>(modelsKeys.detail(id), (current) =>
        current ? strip(current) : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (model) => {
      queryClient.setQueryData(modelsKeys.detail(model.id), model)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: modelsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: modelsKeys.detail(id) }),
      ]),
  })
}

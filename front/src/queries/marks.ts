import {
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
import { modelsKeys } from './models'
import { catalogQueryDefaults, queryClient as appQueryClient } from './query-client'
import { sparePartsKeys } from './spare-parts'
import type { Mark, MarkWriteInput, Model, SparePart } from './types'
import { imageFilename } from './types'

export const marksKeys = {
  all: ['marks'] as const,
  lists: () => [...marksKeys.all, 'list'] as const,
  list: () => [...marksKeys.lists()] as const,
  details: () => [...marksKeys.all, 'detail'] as const,
  detail: (id: number) => [...marksKeys.details(), id] as const,
}

export async function getMarks() {
  return apiRequest<Mark[]>('/marks')
}

export async function getMark(id: number) {
  return apiRequest<Mark>(`/marks/${id}`)
}

export async function createMark(input: { name: string } & MarkWriteInput) {
  return apiRequest<Mark>('/marks', {
    method: 'POST',
    json: { name: input.name, description: input.description },
    files: input.images,
  })
}

export async function updateMark(id: number, input: MarkWriteInput) {
  return apiRequest<Mark>(`/marks/${id}`, {
    method: 'PATCH',
    json: { name: input.name, description: input.description },
    files: input.images,
  })
}

export async function deleteMark(id: number) {
  return apiRequest<Mark>(`/marks/${id}`, { method: 'DELETE' })
}

export async function deleteMarkImage(id: number, filename: string) {
  return apiRequest<Mark>(`/marks/${id}/images/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  })
}

export const marksQueries = {
  list: () =>
    queryOptions({
      queryKey: marksKeys.list(),
      queryFn: getMarks,
      ...catalogQueryDefaults,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: marksKeys.detail(id),
      queryFn: () => getMark(id),
      ...catalogQueryDefaults,
      placeholderData: () => {
        const lists = appQueryClient.getQueriesData<Mark[]>({
          queryKey: marksKeys.lists(),
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

export function useMarksQuery() {
  return useQuery(marksQueries.list())
}

export function useMarkQuery(id: number) {
  return useQuery({
    ...marksQueries.detail(id),
    enabled: id > 0,
  })
}

export function useCreateMarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMark,
    onSuccess: (mark) => {
      queryClient.setQueryData(marksKeys.detail(mark.id), mark)
      prependListItem(queryClient, marksKeys.list(), mark)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: marksKeys.lists() }),
  })
}

export function useUpdateMarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & MarkWriteInput) =>
      updateMark(id, input),
    onMutate: async ({ id, ...input }) => {
      const patch = definedPatch(withoutImages(input))
      const lists = await cancelAndSnapshot<Mark[]>(queryClient, marksKeys.lists())
      const details = await cancelAndSnapshot<Mark>(queryClient, marksKeys.detail(id))
      patchListItem<Mark>(queryClient, marksKeys.lists(), id, patch)
      queryClient.setQueryData<Mark>(marksKeys.detail(id), (current) =>
        current ? { ...current, ...patch } : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (mark) => {
      queryClient.setQueryData(marksKeys.detail(mark.id), mark)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: marksKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: marksKeys.detail(id) }),
      ]),
  })
}

export function useDeleteMarkMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMark,
    onMutate: async (id) => {
      const marks = await cancelAndSnapshot<Mark[]>(queryClient, marksKeys.lists())
      const models = await cancelAndSnapshot<Model[]>(queryClient, modelsKeys.lists())
      const parts = await cancelAndSnapshot<SparePart[]>(
        queryClient,
        sparePartsKeys.lists(),
      )
      removeListItem<Mark>(queryClient, marksKeys.lists(), id)
      mapListQueries<Model>(queryClient, modelsKeys.lists(), (items) =>
        items.filter((item) => item.markId !== id),
      )
      mapListQueries<SparePart>(queryClient, sparePartsKeys.lists(), (items) =>
        items.filter((item) => item.markId !== id),
      )
      queryClient.removeQueries({ queryKey: marksKeys.detail(id) })
      return { marks, models, parts }
    },
    onError: (_error, _id, context) => {
      restoreSnapshots(queryClient, context?.marks)
      restoreSnapshots(queryClient, context?.models)
      restoreSnapshots(queryClient, context?.parts)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: marksKeys.all }),
        queryClient.invalidateQueries({ queryKey: modelsKeys.all }),
        queryClient.invalidateQueries({ queryKey: sparePartsKeys.all }),
      ]),
  })
}

export function useDeleteMarkImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filename }: { id: number; filename: string }) =>
      deleteMarkImage(id, filename),
    onMutate: async ({ id, filename }) => {
      const lists = await cancelAndSnapshot<Mark[]>(queryClient, marksKeys.lists())
      const details = await cancelAndSnapshot<Mark>(queryClient, marksKeys.detail(id))
      const strip = (item: Mark) => ({
        ...item,
        images: item.images.filter((path) => imageFilename(path) !== filename),
      })
      mapListQueries<Mark>(queryClient, marksKeys.lists(), (items) =>
        items.map((item) => (item.id === id ? strip(item) : item)),
      )
      queryClient.setQueryData<Mark>(marksKeys.detail(id), (current) =>
        current ? strip(current) : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (mark) => {
      queryClient.setQueryData(marksKeys.detail(mark.id), mark)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: marksKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: marksKeys.detail(id) }),
      ]),
  })
}

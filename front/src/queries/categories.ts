import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  cancelAndSnapshot,
  definedPatch,
  patchListItem,
  prependListItem,
  removeListItem,
  restoreSnapshots,
} from './cache'
import { apiRequest } from './http'
import { catalogQueryDefaults, queryClient as appQueryClient } from './query-client'
import type { Category, CategoryWriteInput } from './types'

export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: () => [...categoriesKeys.lists()] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoriesKeys.details(), id] as const,
}

export async function getCategories() {
  return apiRequest<Category[]>('/categories')
}

export async function getCategory(id: number) {
  return apiRequest<Category>(`/categories/${id}`)
}

export async function createCategory(input: { name: string } & CategoryWriteInput) {
  return apiRequest<Category>('/categories', {
    method: 'POST',
    json: { name: input.name, description: input.description },
  })
}

export async function updateCategory(id: number, input: CategoryWriteInput) {
  return apiRequest<Category>(`/categories/${id}`, {
    method: 'PATCH',
    json: { name: input.name, description: input.description },
  })
}

export async function deleteCategory(id: number) {
  return apiRequest<Category>(`/categories/${id}`, { method: 'DELETE' })
}

export const categoriesQueries = {
  list: () =>
    queryOptions({
      queryKey: categoriesKeys.list(),
      queryFn: getCategories,
      ...catalogQueryDefaults,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: categoriesKeys.detail(id),
      queryFn: () => getCategory(id),
      ...catalogQueryDefaults,
      placeholderData: () => {
        const lists = appQueryClient.getQueriesData<Category[]>({
          queryKey: categoriesKeys.lists(),
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

export function useCategoriesQuery() {
  return useQuery(categoriesQueries.list())
}

export function useCategoryQuery(id: number) {
  return useQuery({
    ...categoriesQueries.detail(id),
    enabled: id > 0,
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (category) => {
      queryClient.setQueryData(categoriesKeys.detail(category.id), category)
      prependListItem(queryClient, categoriesKeys.list(), category)
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() }),
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & CategoryWriteInput) =>
      updateCategory(id, input),
    onMutate: async ({ id, ...input }) => {
      const patch = definedPatch(input)
      const lists = await cancelAndSnapshot<Category[]>(
        queryClient,
        categoriesKeys.lists(),
      )
      const details = await cancelAndSnapshot<Category>(
        queryClient,
        categoriesKeys.detail(id),
      )
      patchListItem<Category>(queryClient, categoriesKeys.lists(), id, patch)
      queryClient.setQueryData<Category>(categoriesKeys.detail(id), (current) =>
        current ? { ...current, ...patch } : current,
      )
      return { lists, details }
    },
    onError: (_error, _input, context) => {
      restoreSnapshots(queryClient, context?.lists)
      restoreSnapshots(queryClient, context?.details)
    },
    onSuccess: (category) => {
      queryClient.setQueryData(categoriesKeys.detail(category.id), category)
    },
    onSettled: (_data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoriesKeys.detail(id) }),
      ]),
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      const lists = await cancelAndSnapshot<Category[]>(
        queryClient,
        categoriesKeys.lists(),
      )
      removeListItem<Category>(queryClient, categoriesKeys.lists(), id)
      queryClient.removeQueries({ queryKey: categoriesKeys.detail(id) })
      return { lists }
    },
    onError: (_error, _id, context) => {
      restoreSnapshots(queryClient, context?.lists)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoriesKeys.all }),
  })
}

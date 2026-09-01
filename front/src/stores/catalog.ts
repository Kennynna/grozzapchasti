// Выбранные марка / модель / категория. Persist, чтобы вернуться со других страниц. См. FRONT.md
import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CatalogSelection = {
  markId?: number
  modelId?: number
  categoryId?: number
}

type CatalogState = CatalogSelection & {
  setMark: (markId: number | undefined) => void
  setModel: (modelId: number | undefined) => void
  setCategory: (categoryId: number | undefined) => void
  replace: (next: CatalogSelection) => void
  clear: () => void
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      markId: undefined,
      modelId: undefined,
      categoryId: undefined,
      setMark: (markId) => set({ markId, modelId: undefined }),
      setModel: (modelId) => set({ modelId }),
      setCategory: (categoryId) => set({ categoryId }),
      replace: (next) =>
        set({
          markId: next.markId,
          modelId: next.markId ? next.modelId : undefined,
          categoryId: next.categoryId,
        }),
      clear: () =>
        set({
          markId: undefined,
          modelId: undefined,
          categoryId: undefined,
        }),
    }),
    {
      name: 'grozzapchasti.catalog',
      partialize: (state) => ({
        markId: state.markId,
        modelId: state.modelId,
        categoryId: state.categoryId,
      }),
    },
  ),
)

export function useCatalogHydrated() {
  return useSyncExternalStore(
    (onChange) => useCatalogStore.persist.onFinishHydration(onChange),
    () => useCatalogStore.persist.hasHydrated(),
    () => false,
  )
}

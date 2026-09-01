// Избранное в localStorage, только id запчастей. Карточка: useFavoritesStore.getState().toggle(id)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type FavoritesState = {
  ids: number[]
  toggle: (sparePartId: number) => void
  has: (sparePartId: number) => boolean
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (sparePartId) => {
        const ids = get().ids
        set({
          ids: ids.includes(sparePartId)
            ? ids.filter((id) => id !== sparePartId)
            : [...ids, sparePartId],
        })
      },
      has: (sparePartId) => get().ids.includes(sparePartId),
      clear: () => set({ ids: [] }),
    }),
    { name: 'grozzapchasti.favorites' },
  ),
)

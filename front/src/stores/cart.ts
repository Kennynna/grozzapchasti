// Корзина в localStorage. Не ходить на бэк — заказов нет. См. FRONT.md § «Корзина и избранное»
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  sparePartId: number
  quantity: number
}

type CartState = {
  items: CartItem[]
  add: (sparePartId: number, quantity?: number) => void
  setQuantity: (sparePartId: number, quantity: number) => void
  remove: (sparePartId: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (sparePartId, quantity = 1) => {
        const current = get().items.find((item) => item.sparePartId === sparePartId)
        if (current) {
          set({
            items: get().items.map((item) =>
              item.sparePartId === sparePartId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          })
          return
        }
        set({ items: [...get().items, { sparePartId, quantity }] })
      },
      setQuantity: (sparePartId, quantity) => {
        if (quantity < 1) {
          set({
            items: get().items.filter((item) => item.sparePartId !== sparePartId),
          })
          return
        }
        set({
          items: get().items.map((item) =>
            item.sparePartId === sparePartId ? { ...item, quantity } : item,
          ),
        })
      },
      remove: (sparePartId) =>
        set({
          items: get().items.filter((item) => item.sparePartId !== sparePartId),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'grozzapchasti.cart' },
  ),
)

export function selectCartCount(state: CartState) {
  return state.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function selectCartQuantity(sparePartId: number) {
  return (state: CartState) =>
    state.items.find((item) => item.sparePartId === sparePartId)?.quantity ?? 0
}

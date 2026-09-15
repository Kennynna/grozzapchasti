import { createFileRoute } from '@tanstack/react-router'
import { CartView } from '@/components/cart/CartView'
import { site } from '@/config/site'
import { pageMeta } from '@/lib/seo'

export const Route = createFileRoute('/cart')({
  head: () => ({
    // Корзина живёт в localStorage, в индексе ей делать нечего
    meta: pageMeta({ title: `Корзина · ${site.name}`, path: '/cart', noindex: true }),
  }),
  component: CartPage,
})

function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">Корзина</h1>
      <CartView />
    </div>
  )
}

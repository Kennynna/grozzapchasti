import { createFileRoute } from '@tanstack/react-router'
import { CartView } from '@/components/cart/CartView'
import { site } from '@/config/site'

export const Route = createFileRoute('/cart')({
  head: () => ({
    meta: [
      { title: `Корзина · ${site.name}` },
      { name: 'description', content: site.description },
    ],
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

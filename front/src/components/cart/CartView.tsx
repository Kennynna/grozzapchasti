import { Link } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { QueryStatus } from '@/components/QueryStatus'
import { TelegramOrderActions } from '@/components/cart/TelegramOrderActions'
import { CardImage } from '@/components/catalog/CardImage'
import { CartLinesSkeleton } from '@/components/query-skeletons'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { orderTotal, type OrderLine } from '@/lib/order-message'
import { firstImageSrc, useSparePartsQuery, type SparePart } from '@/queries'
import { useCartStore, type CartItem } from '@/stores'

function EmptyCart() {
  return (
    <div className="mt-8">
      <p className="text-muted-foreground">Корзина пуста.</p>
      <Button className="mt-6" variant="outline" asChild>
        <Link to="/" hash="catalog">
          Перейти в каталог
        </Link>
      </Button>
    </div>
  )
}

function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
}: {
  value: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Меньше"
        disabled={value <= 1}
        onClick={onDecrease}
      >
        <Minus />
      </Button>
      <span className="min-w-8 text-center text-sm tabular-nums">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Больше"
        onClick={onIncrease}
      >
        <Plus />
      </Button>
    </div>
  )
}

function UnavailableRow({ onRemove }: { onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-border py-4">
      <p className="text-sm text-muted-foreground">Больше недоступен</p>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
        Убрать
      </Button>
    </li>
  )
}

function AvailableRow({
  part,
  quantity,
}: {
  part: SparePart
  quantity: number
}) {
  const image = firstImageSrc(part.images)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const remove = useCartStore((state) => state.remove)

  return (
    <li className="flex gap-4 border-b border-border py-4">
      <Link
        to="/parts/$partId"
        params={{ partId: part.id }}
        className="shrink-0"
        aria-label={part.name}
      >
        <CardImage src={image} alt={part.name} className="size-20 aspect-auto rounded-md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to="/parts/$partId"
          params={{ partId: part.id }}
          className="font-heading text-base font-semibold leading-snug hover:text-primary"
        >
          {part.name}
        </Link>
        {part.article ? (
          <p className="mt-1 text-xs text-muted-foreground">{part.article}</p>
        ) : null}
        <p className="mt-2 text-sm font-medium text-primary">{formatPrice(part.price)}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            value={quantity}
            onDecrease={() => setQuantity(part.id, quantity - 1)}
            onIncrease={() => setQuantity(part.id, quantity + 1)}
          />
          <div className="flex items-center gap-3">
            <p className="text-sm tabular-nums">{formatPrice(part.price * quantity)}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Убрать"
              onClick={() => remove(part.id)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}

function CartItems({ items, parts }: { items: CartItem[]; parts: SparePart[] }) {
  const clear = useCartStore((state) => state.clear)
  const remove = useCartStore((state) => state.remove)
  const partsById = new Map(parts.map((part) => [part.id, part]))
  const lines: { item: CartItem; part: SparePart }[] = []
  const unavailable: CartItem[] = []

  for (const item of items) {
    const part = partsById.get(item.sparePartId)
    if (part) {
      lines.push({ item, part })
    } else {
      unavailable.push(item)
    }
  }

  const orderLines: OrderLine[] = lines.map(({ item, part }) => ({
    name: part.name,
    article: part.article,
    quantity: item.quantity,
    price: part.price,
  }))
  const total = orderTotal(orderLines)
  const canOrder = orderLines.length > 0

  return (
    <div className="mt-8">
      <ul>
        {unavailable.map((item) => (
          <UnavailableRow
            key={item.sparePartId}
            onRemove={() => remove(item.sparePartId)}
          />
        ))}
        {lines.map(({ item, part }) => (
          <AvailableRow key={part.id} part={part} quantity={item.quantity} />
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Итого</p>
          <p className="mt-1 text-2xl font-medium text-primary">{formatPrice(total)}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <Button type="button" variant="ghost" className="self-start sm:self-end" onClick={() => clear()}>
            Очистить
          </Button>
          <TelegramOrderActions lines={orderLines} disabled={!canOrder} />
        </div>
      </div>
    </div>
  )
}

export function CartView() {
  const items = useCartStore((state) => state.items)
  const partsQuery = useSparePartsQuery()

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <QueryStatus
      query={partsQuery}
      skeleton={<CartLinesSkeleton />}
    >
      {(parts) => <CartItems items={items} parts={parts} />}
    </QueryStatus>
  )
}

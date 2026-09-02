import { Link } from '@tanstack/react-router'
import { Check, Heart, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { QueryStatus } from '@/components/QueryStatus'
import { CardImage } from '@/components/catalog/CardImage'
import { FavoritesLinesSkeleton } from '@/components/query-skeletons'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatPrice } from '@/lib/format'
import { firstImageSrc, useSparePartsQuery, type SparePart } from '@/queries'
import { useCartStore, useFavoritesStore } from '@/stores'

type FavoritesSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FavoriteRow({
  part,
  onOpenChange,
}: {
  part: SparePart
  onOpenChange: (open: boolean) => void
}) {
  const image = firstImageSrc(part.images)
  const toggle = useFavoritesStore((state) => state.toggle)
  const addToCart = useCartStore((state) => state.add)
  const inCart = useCartStore((state) =>
    state.items.some((item) => item.sparePartId === part.id),
  )

  return (
    <li className="flex gap-3 border-b border-border py-3">
      <Link
        to="/parts/$partId"
        params={{ partId: part.id }}
        className="shrink-0"
        aria-label={part.name}
        onClick={() => onOpenChange(false)}
      >
        <CardImage src={image} alt={part.name} className="size-16 aspect-auto rounded-md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to="/parts/$partId"
          params={{ partId: part.id }}
          className="font-heading text-sm font-semibold leading-snug hover:text-primary"
          onClick={() => onOpenChange(false)}
        >
          {part.name}
        </Link>
        {part.article ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{part.article}</p>
        ) : null}
        <p className="mt-1 text-sm font-medium text-primary">{formatPrice(part.price)}</p>
        <div className="mt-2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Убрать из избранного"
            onClick={() => toggle(part.id)}
          >
            <Heart className="fill-primary text-primary" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={inCart ? 'В корзине' : 'Добавить в корзину'}
            onClick={() => {
              addToCart(part.id)
              toast.success(inCart ? 'Ещё одна в корзине' : 'Добавлено в корзину')
            }}
          >
            {inCart ? <Check className="text-primary" /> : <Plus />}
          </Button>
        </div>
      </div>
    </li>
  )
}

function FavoritesList({
  ids,
  parts,
  onOpenChange,
}: {
  ids: number[]
  parts: SparePart[]
  onOpenChange: (open: boolean) => void
}) {
  const toggle = useFavoritesStore((state) => state.toggle)
  const partsById = new Map(parts.map((part) => [part.id, part]))
  const available: SparePart[] = []
  const unavailableIds: number[] = []

  for (const id of ids) {
    const part = partsById.get(id)
    if (part) {
      available.push(part)
    } else {
      unavailableIds.push(id)
    }
  }

  return (
    <ul>
      {unavailableIds.map((id) => (
        <li
          key={id}
          className="flex items-center justify-between gap-3 border-b border-border py-3"
        >
          <p className="text-sm text-muted-foreground">Больше недоступен</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => toggle(id)}>
            Убрать
          </Button>
        </li>
      ))}
      {available.map((part) => (
        <FavoriteRow key={part.id} part={part} onOpenChange={onOpenChange} />
      ))}
    </ul>
  )
}

export function FavoritesSheet({ open, onOpenChange }: FavoritesSheetProps) {
  const ids = useFavoritesStore((state) => state.ids)
  const partsQuery = useSparePartsQuery({}, { enabled: open })
  const empty = ids.length === 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Избранное</SheetTitle>
          <SheetDescription>
            {empty ? 'Пока пусто — добавьте запчасти с витрины.' : 'Сохранено на этом устройстве.'}
          </SheetDescription>
        </SheetHeader>

        {empty ? null : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <QueryStatus
              query={partsQuery}
              skeleton={<FavoritesLinesSkeleton />}
            >
              {(parts) => (
                <FavoritesList ids={ids} parts={parts} onOpenChange={onOpenChange} />
              )}
            </QueryStatus>
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" asChild>
            <Link to="/" hash="catalog" onClick={() => onOpenChange(false)}>
              Перейти в каталог
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

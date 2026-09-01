import { Link } from '@tanstack/react-router'
import { Check, Heart, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AdminKebab } from '@/components/admin/AdminKebab'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { firstImageSrc, type SparePart } from '@/queries'
import { selectCartQuantity, useCartStore, useFavoritesStore } from '@/stores'
import { CardImage } from './CardImage'

type SparePartCardProps = {
  part: SparePart
  markName?: string
  isAdmin?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function SparePartCard({
  part,
  markName,
  isAdmin = false,
  onEdit,
  onDelete,
}: SparePartCardProps) {
  const image = firstImageSrc(part.images)
  const favorite = useFavoritesStore((state) => state.ids.includes(part.id))
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const addToCart = useCartStore((state) => state.add)
  const cartQuantity = useCartStore(selectCartQuantity(part.id))

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative">
        <Link
          to="/parts/$partId"
          params={{ partId: part.id }}
          className="block"
          aria-label={part.name}
        >
          <CardImage src={image} alt={part.name} />
        </Link>
        {onEdit && onDelete ? (
          <AdminKebab
            isAdmin={isAdmin}
            className="absolute top-1.5 left-1.5 z-10 md:top-2 md:left-2"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 md:top-2 md:right-2 md:flex-row">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}
            className="bg-background/80 backdrop-blur-sm"
            onClick={(event) => {
              event.stopPropagation()
              toggleFavorite(part.id)
            }}
          >
            <Heart className={cn(favorite && 'fill-primary text-primary')} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={cartQuantity > 0 ? 'В корзине' : 'Добавить в корзину'}
            className="bg-background/80 backdrop-blur-sm"
            onClick={(event) => {
              event.stopPropagation()
              addToCart(part.id)
              toast.success(cartQuantity > 0 ? 'Ещё одна в корзине' : 'Добавлено в корзину')
            }}
          >
            {cartQuantity > 0 ? (
              <Check className="text-primary" />
            ) : (
              <Plus />
            )}
          </Button>
        </div>
      </div>
      <Link
        to="/parts/$partId"
        params={{ partId: part.id }}
        className="flex flex-1 flex-col gap-0.5 p-3 md:gap-1 md:p-4"
      >
        <h3 className="line-clamp-2 min-h-10 font-heading text-sm font-semibold leading-snug md:min-h-12 md:text-base">
          {part.name}
        </h3>
        {markName ? (
          <p className="truncate text-xs text-muted-foreground md:text-sm">{markName}</p>
        ) : null}
        {part.article ? (
          <p className="truncate text-[11px] text-muted-foreground md:text-xs">{part.article}</p>
        ) : null}
        <p className="mt-auto pt-2 text-base font-medium text-primary md:pt-3 md:text-lg">
          {formatPrice(part.price)}
        </p>
      </Link>
    </article>
  )
}

import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdminCreatePath =
  | '/admin/new/mark'
  | '/admin/new/model'
  | '/admin/new/category'
  | '/admin/new/part'

type AdminAddTileProps = {
  isAdmin: boolean
  to: AdminCreatePath
  label: string
  variant?: 'tile' | 'chip' | 'card'
}

export function AdminAddTile({
  isAdmin,
  to,
  label,
  variant = 'tile',
}: AdminAddTileProps) {
  if (!isAdmin) {
    return null
  }

  return (
    <Link
      to={to}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        'flex shrink-0 items-center justify-center border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary',
        variant === 'tile' && 'h-28 w-36 flex-col gap-1 rounded-lg bg-card',
        variant === 'chip' && 'h-8 rounded-full px-3 text-sm font-medium',
        variant === 'card' &&
          'h-full min-h-40 flex-col gap-2 rounded-lg bg-card p-4 md:min-h-64 md:p-6',
      )}
    >
      <Plus className="size-4" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

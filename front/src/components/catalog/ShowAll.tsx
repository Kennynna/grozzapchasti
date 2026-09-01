import { LayoutGrid } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { HorizontalScroller } from './HorizontalScroller'

export function StripOrWrap({
  expanded,
  children,
  className,
}: {
  expanded: boolean
  children: ReactNode
  className?: string
}) {
  if (expanded) {
    return <div className={cn('flex flex-wrap gap-3', className)}>{children}</div>
  }

  return <HorizontalScroller className={className}>{children}</HorizontalScroller>
}

type ShowAllTileProps = {
  total: number
  onClick: () => void
  variant?: 'tile' | 'chip'
}

export function ShowAllTile({ total, onClick, variant = 'tile' }: ShowAllTileProps) {
  if (variant === 'chip') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Показать все, ${total}`}
        className="shrink-0 rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Показать все
        <span className="ml-1.5 text-foreground/80">{total}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Показать все, ${total}`}
      className={cn(
        'flex w-36 shrink-0 flex-col overflow-hidden rounded-lg border border-dashed border-border bg-card text-left transition-colors',
        'hover:border-primary hover:bg-accent',
      )}
    >
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 bg-secondary">
        <LayoutGrid className="size-7 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{total}</span>
      </div>
      <span className="px-3 py-2 text-sm font-medium">Показать все</span>
    </button>
  )
}

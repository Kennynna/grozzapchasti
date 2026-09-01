import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CatalogPaginationProps = {
  page: number
  totalPages: number
  onPage: (page: number) => void
}

function pageItems(page: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const items: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) {
    items.push('ellipsis')
  }
  for (let index = start; index <= end; index += 1) {
    items.push(index)
  }
  if (end < total - 1) {
    items.push('ellipsis')
  }
  items.push(total)
  return items
}

export function CatalogPagination({ page, totalPages, onPage }: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Страницы каталога" className="flex flex-wrap items-center justify-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Предыдущая страница"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft />
      </Button>
      {pageItems(page, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`e-${index}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === page ? 'default' : 'ghost'}
            size="sm"
            aria-current={item === page ? 'page' : undefined}
            className={cn('min-w-8 tabular-nums')}
            onClick={() => onPage(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Следующая страница"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}

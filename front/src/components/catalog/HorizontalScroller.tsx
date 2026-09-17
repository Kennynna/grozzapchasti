import { cn } from '@/lib/utils'
import { useLayoutEffect, useRef, type ReactNode } from 'react'

const scrollbarClass =
  'overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_var(--color-muted)] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary'

export function HorizontalScroller({
  children,
  className,
  rows = 1,
  activeKey,
}: {
  children: ReactNode
  className?: string
  rows?: 1 | 2
  activeKey?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || activeKey == null) {
      return
    }
    const selected = root.querySelector<HTMLElement>('[data-strip-selected="true"]')
    if (!selected) {
      return
    }
    const rootRect = root.getBoundingClientRect()
    const selectedRect = selected.getBoundingClientRect()
    if (selectedRect.left < rootRect.left || selectedRect.right > rootRect.right) {
      root.scrollTo({
        left: root.scrollLeft + selectedRect.left - rootRect.left - 12,
      })
    }
  }, [activeKey])

  if (rows === 2) {
    return (
      <div ref={ref} className={cn('min-w-0', scrollbarClass, className)}>
        {/* Внутренняя сетка w-max, скролл на обёртке — иначе колонки раздувают страницу */}
        <div className="grid w-max grid-flow-col grid-rows-[auto_auto] auto-cols-[9rem] gap-3">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('flex min-w-0 gap-3', scrollbarClass, className)}>
      {children}
    </div>
  )
}

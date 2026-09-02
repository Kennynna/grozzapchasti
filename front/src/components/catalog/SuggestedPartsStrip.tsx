import { useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { SparePart } from '@/queries'
import { SparePartCard } from './SparePartCard'

type SuggestedPartsStripProps = {
  parts: SparePart[]
  markLabel: (part: SparePart) => string | undefined
  isAdmin?: boolean
  onEdit?: (id: number) => void
  onDelete?: (part: SparePart) => void
  className?: string
}

const COPIES = 3

export function SuggestedPartsStrip({
  parts,
  markLabel,
  isAdmin = false,
  onEdit,
  onDelete,
  className,
}: SuggestedPartsStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const loop = Array.from({ length: COPIES }, (_, copy) =>
    parts.map((part) => ({ copy, part })),
  ).flat()

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el || parts.length === 0) {
      return
    }
    const scroller = el

    function unit() {
      return scroller.scrollWidth / COPIES
    }

    function wrap() {
      const width = unit()
      if (width <= 0) {
        return
      }
      if (scroller.scrollLeft >= width * 2) {
        scroller.scrollLeft -= width
      } else if (scroller.scrollLeft < width) {
        scroller.scrollLeft += width
      }
    }

    scroller.scrollLeft = unit()
    const ready = window.requestAnimationFrame(() => {
      scroller.scrollLeft = unit()
    })
    scroller.addEventListener('scroll', wrap, { passive: true })

    let frame = 0
    let leftover = 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function tick() {
      if (!reduceMotion && !pausedRef.current) {
        leftover += 0.45
        const step = Math.floor(leftover)
        if (step > 0) {
          scroller.scrollLeft += step
          leftover -= step
          wrap()
        }
      }
      frame = window.requestAnimationFrame(tick)
    }

    if (!reduceMotion) {
      frame = window.requestAnimationFrame(tick)
    }

    return () => {
      window.cancelAnimationFrame(ready)
      scroller.removeEventListener('scroll', wrap)
      window.cancelAnimationFrame(frame)
    }
  }, [parts])

  if (parts.length === 0) {
    return null
  }

  return (
    <div
      ref={scrollerRef}
      className={cn(
        'flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      onPointerEnter={() => {
        pausedRef.current = true
      }}
      onPointerLeave={() => {
        pausedRef.current = false
      }}
    >
      {loop.map(({ copy, part }) => (
        <SparePartCard
          key={`${copy}-${part.id}`}
          part={part}
          markName={markLabel(part)}
          isAdmin={isAdmin}
          className="w-48 shrink-0 md:w-56"
          onEdit={onEdit ? () => onEdit(part.id) : undefined}
          onDelete={onDelete ? () => onDelete(part) : undefined}
        />
      ))}
    </div>
  )
}

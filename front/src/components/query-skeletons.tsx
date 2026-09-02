import { HorizontalScroller } from '@/components/catalog/HorizontalScroller'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const partsGridClass = 'grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3'

export function StripTilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <HorizontalScroller>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-28 w-36 shrink-0 rounded-lg" />
      ))}
    </HorizontalScroller>
  )
}

export function CategoryChipsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <HorizontalScroller>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-full" />
      ))}
    </HorizontalScroller>
  )
}

export function SparePartCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-auto h-5 w-20" />
      </div>
    </div>
  )
}

export function PartsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={partsGridClass}>
      {Array.from({ length: count }, (_, index) => (
        <SparePartCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function SuggestedStripSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="space-y-3">
      <Skeleton className="h-6 w-56" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }, (_, index) => (
          <SparePartCardSkeleton key={index} className="w-48 shrink-0 md:w-56" />
        ))}
      </div>
    </section>
  )
}

export function CatalogPartsSkeleton() {
  return (
    <div className="space-y-10">
      <PartsGridSkeleton />
      <SuggestedStripSkeleton />
    </div>
  )
}

export function ProductPageSkeleton() {
  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="size-16 rounded-md" />
            <Skeleton className="size-16 rounded-md" />
            <Skeleton className="size-16 rounded-md" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-20 w-full max-w-prose" />
          <div className="mt-4 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>
      <div className="mt-16 border-t border-border pt-10">
        <SuggestedStripSkeleton />
      </div>
    </div>
  )
}

export function CartLinesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-8">
      <ul>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="flex gap-4 border-b border-border py-4">
            <Skeleton className="size-20 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-8 w-32" />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  )
}

export function FavoritesLinesSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex gap-3 border-b border-border py-3">
          <Skeleton className="size-16 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

export function LoginSessionSkeleton() {
  return (
    <div className="mx-auto max-w-sm space-y-6 px-4 py-16">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

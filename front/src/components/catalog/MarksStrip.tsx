import { useState } from 'react'
import { toast } from 'sonner'
import { AdminKebab } from '@/components/admin/AdminKebab'
import {
  ConfirmDeleteDialog,
  EditMarkDialog,
} from '@/components/admin/lazy-dialogs'
import { QueryStatus } from '@/components/QueryStatus'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { previewStrip } from '@/lib/catalog-strip'
import { cn } from '@/lib/utils'
import { firstImageSrc, useDeleteMarkMutation, type Mark } from '@/queries'
import type { UseQueryResult } from '@tanstack/react-query'
import { AdminAddTile } from './AdminAddTile'
import { CardImage } from './CardImage'
import { HorizontalScroller } from './HorizontalScroller'
import { ShowAllTile, StripOrWrap } from './ShowAll'

type MarksStripProps = {
  query: UseQueryResult<Mark[]>
  selectedId?: number
  onSelect: (id: number | undefined) => void
  isAdmin: boolean
}

export function MarksStrip({ query, selectedId, onSelect, isAdmin }: MarksStripProps) {
  const deleteMutation = useDeleteMarkMutation()
  const [editId, setEditId] = useState<number>()
  const [deleting, setDeleting] = useState<Mark>()
  const [expanded, setExpanded] = useState(false)
  const editing = (query.data ?? []).find((item) => item.id === editId)

  return (
    <section id="marks" className="scroll-mt-20 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Марка</h2>
          <p className="text-sm text-muted-foreground">Выберите марку</p>
        </div>
        {expanded ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
            Свернуть
          </Button>
        ) : null}
      </div>
      <QueryStatus
        query={query}
        isEmpty={(items) => items.length === 0 && !isAdmin}
        emptyMessage="Марок пока нет"
        skeleton={
          <HorizontalScroller>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-28 w-36 shrink-0 rounded-lg" />
            ))}
          </HorizontalScroller>
        }
      >
        {(items) => {
          const { items: preview, hasMore } = previewStrip(items, selectedId)
          const visible = expanded ? items : preview
          return (
            <StripOrWrap expanded={expanded}>
              <AdminAddTile isAdmin={isAdmin} to="/admin/new/mark" label="Новая марка" />
              {visible.map((mark, index) => (
                <MarkTile
                  key={mark.id}
                  mark={mark}
                  selected={selectedId === mark.id}
                  onSelect={onSelect}
                  isAdmin={isAdmin}
                  priority={index < 2}
                  onEdit={() => setEditId(mark.id)}
                  onDelete={() => {
                    deleteMutation.reset()
                    setDeleting(mark)
                  }}
                />
              ))}
              {!expanded && hasMore ? (
                <ShowAllTile total={items.length} onClick={() => setExpanded(true)} />
              ) : null}
            </StripOrWrap>
          )
        }}
      </QueryStatus>
      <EditMarkDialog
        mark={editing}
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setEditId(undefined)
          }
        }}
      />
      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(undefined)
          }
        }}
        title="Удалить марку?"
        description="Удалятся все модели и запчасти этой марки."
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onConfirm={() => {
          if (!deleting) {
            return
          }
          deleteMutation.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Марка удалена')
              setDeleting(undefined)
            },
          })
        }}
      />
    </section>
  )
}

function MarkTile({
  mark,
  selected,
  onSelect,
  isAdmin,
  priority,
  onEdit,
  onDelete,
}: {
  mark: Mark
  selected: boolean
  onSelect: (id: number | undefined) => void
  isAdmin: boolean
  priority: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const image = firstImageSrc(mark.images)

  return (
    <div className="relative w-36 shrink-0">
      <button
        type="button"
        onClick={() => onSelect(selected ? undefined : mark.id)}
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors',
          selected
            ? 'border-primary'
            : 'border-border hover:border-muted-foreground/40 hover:bg-accent',
        )}
      >
        <CardImage src={image} alt={mark.name} priority={priority} />
        <span className="truncate px-3 py-2 text-sm font-medium">{mark.name}</span>
      </button>
      <AdminKebab
        isAdmin={isAdmin}
        className="absolute top-1.5 right-1.5 z-10"
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}

import { useState } from 'react'
import { toast } from 'sonner'
import { AdminKebab } from '@/components/admin/AdminKebab'
import {
  ConfirmDeleteDialog,
  EditModelDialog,
} from '@/components/admin/lazy-dialogs'
import { QueryStatus } from '@/components/QueryStatus'
import { StripTilesSkeleton } from '@/components/query-skeletons'
import { cn } from '@/lib/utils'
import { firstImageSrc, useDeleteModelMutation, type Model } from '@/queries'
import type { UseQueryResult } from '@tanstack/react-query'
import { AdminAddTile } from './AdminAddTile'
import { CardImage } from './CardImage'
import { HorizontalScroller } from './HorizontalScroller'

type ModelsStripProps = {
  query: UseQueryResult<Model[]>
  markId: number
  selectedId?: number
  onSelect: (id: number | undefined) => void
  isAdmin: boolean
}

export function ModelsStrip({
  query,
  markId,
  selectedId,
  onSelect,
  isAdmin,
}: ModelsStripProps) {
  const deleteMutation = useDeleteModelMutation()
  const [editId, setEditId] = useState<number>()
  const [deleting, setDeleting] = useState<Model>()
  const editing = (query.data ?? []).find((item) => item.id === editId)

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Модель</h2>
        <p className="text-sm text-muted-foreground">Выберите модель</p>
      </div>
      <QueryStatus
        query={query}
        isEmpty={(items) =>
          items.filter((item) => item.markId === markId).length === 0 && !isAdmin
        }
        emptyMessage="Моделей этой марки нет"
        skeleton={<StripTilesSkeleton rows={2} />}
      >
        {(items) => {
          const ofMark = items.filter((item) => item.markId === markId)
          return (
            <HorizontalScroller rows={2} activeKey={selectedId} label="Модели">
              <AdminAddTile isAdmin={isAdmin} to="/admin/new/model" label="Новая модель" />
              {ofMark.map((model) => (
                <ModelTile
                  key={model.id}
                  model={model}
                  selected={selectedId === model.id}
                  onSelect={onSelect}
                  isAdmin={isAdmin}
                  onEdit={() => setEditId(model.id)}
                  onDelete={() => {
                    deleteMutation.reset()
                    setDeleting(model)
                  }}
                />
              ))}
            </HorizontalScroller>
          )
        }}
      </QueryStatus>
      <EditModelDialog
        model={editing}
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
        title="Удалить модель?"
        description="Удалятся все запчасти этой модели."
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onConfirm={() => {
          if (!deleting) {
            return
          }
          deleteMutation.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Модель удалена')
              setDeleting(undefined)
            },
          })
        }}
      />
    </section>
  )
}

function ModelTile({
  model,
  selected,
  onSelect,
  isAdmin,
  onEdit,
  onDelete,
}: {
  model: Model
  selected: boolean
  onSelect: (id: number | undefined) => void
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const image = firstImageSrc(model.images)

  return (
    <div className="relative w-36" data-strip-selected={selected ? 'true' : undefined}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(selected ? undefined : model.id)}
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          selected
            ? 'border-primary'
            : 'border-border hover:border-muted-foreground/40 hover:bg-accent',
        )}
      >
        <CardImage src={image} alt="" sizes="144px" />
        <span className="truncate px-3 py-2 text-sm font-medium">{model.name}</span>
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

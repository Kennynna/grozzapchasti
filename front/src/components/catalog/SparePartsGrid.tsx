import { useState } from 'react'
import { toast } from 'sonner'
import {
  ConfirmDeleteDialog,
  EditPartDialog,
} from '@/components/admin/lazy-dialogs'
import { QueryStatus } from '@/components/QueryStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { partFitLabel } from '@/lib/part-fit'
import { cn } from '@/lib/utils'
import { useDeleteSparePartMutation, type Mark, type Model, type SparePart } from '@/queries'
import type { UseQueryResult } from '@tanstack/react-query'
import { AdminAddTile } from './AdminAddTile'
import { CatalogEmpty } from './CatalogEmpty'
import { CatalogPagination } from './CatalogPagination'
import { SparePartCard } from './SparePartCard'

const gridClass = 'grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3'

type SparePartsGridProps = {
  query: UseQueryResult<SparePart[]>
  parts: SparePart[]
  suggestedParts?: SparePart[]
  marks: Mark[]
  models?: Model[]
  isAdmin: boolean
  filteredEmpty: boolean
  onResetFilters: () => void
  page?: number
  totalPages?: number
  onPage?: (page: number) => void
}

export function SparePartsGrid({
  query,
  parts,
  suggestedParts = [],
  marks,
  models = [],
  isAdmin,
  filteredEmpty,
  onResetFilters,
  page = 1,
  totalPages = 1,
  onPage,
}: SparePartsGridProps) {
  const deleteMutation = useDeleteSparePartMutation()
  const [editId, setEditId] = useState<number>()
  const [deleting, setDeleting] = useState<SparePart>()
  const editing = (query.data ?? []).find((item) => item.id === editId)
  const marksById = new Map(marks.map((mark) => [mark.id, mark.name]))
  const modelsById = new Map(models.map((model) => [model.id, model.name]))
  const showMainGrid = parts.length > 0 || isAdmin
  const hasMainBlock = filteredEmpty || showMainGrid

  function markLabel(part: SparePart) {
    return partFitLabel(
      part,
      part.markId ? marksById.get(part.markId) : undefined,
      part.modelId ? modelsById.get(part.modelId) : undefined,
    )
  }

  function openEdit(id: number) {
    setEditId(id)
  }

  function openDelete(part: SparePart) {
    deleteMutation.reset()
    setDeleting(part)
  }

  return (
    <>
      <QueryStatus
        query={query}
        skeleton={
          <div className={gridClass}>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        }
      >
        {() => (
          <div className="space-y-10">
            {filteredEmpty ? (
              <div className="space-y-6">
                <CatalogEmpty onReset={onResetFilters} />
                {isAdmin ? (
                  <div className={gridClass}>
                    <AdminAddTile
                      isAdmin={isAdmin}
                      to="/admin/new/part"
                      label="Новая запчасть"
                      variant="card"
                    />
                  </div>
                ) : null}
              </div>
            ) : showMainGrid ? (
              <div className="space-y-6">
                <div className={gridClass}>
                  <AdminAddTile
                    isAdmin={isAdmin && page === 1}
                    to="/admin/new/part"
                    label="Новая запчасть"
                    variant="card"
                  />
                  {parts.map((part) => (
                    <SparePartCard
                      key={part.id}
                      part={part}
                      markName={markLabel(part)}
                      isAdmin={isAdmin}
                      onEdit={() => openEdit(part.id)}
                      onDelete={() => openDelete(part)}
                    />
                  ))}
                </div>
                {onPage ? (
                  <CatalogPagination page={page} totalPages={totalPages} onPage={onPage} />
                ) : null}
              </div>
            ) : null}
            {suggestedParts.length > 0 ? (
              <section
                className={cn('space-y-3', hasMainBlock && 'border-t border-border pt-10')}
              >
                <h2 className="text-lg font-semibold">Возможно, вам понадобится</h2>
                <div className={gridClass}>
                  {suggestedParts.map((part) => (
                    <SparePartCard
                      key={part.id}
                      part={part}
                      markName={markLabel(part)}
                      isAdmin={isAdmin}
                      onEdit={() => openEdit(part.id)}
                      onDelete={() => openDelete(part)}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </QueryStatus>
      <EditPartDialog
        part={editing}
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
        title="Удалить запчасть?"
        description="Запчасть исчезнет из каталога, корзины и избранного."
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onConfirm={() => {
          if (!deleting) {
            return
          }
          deleteMutation.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Запчасть удалена')
              setDeleting(undefined)
            },
          })
        }}
      />
    </>
  )
}

import { Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AdminKebab } from '@/components/admin/AdminKebab'
import {
  ConfirmDeleteDialog,
  EditCategoryDialog,
} from '@/components/admin/lazy-dialogs'
import { QueryStatus } from '@/components/QueryStatus'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { previewStrip } from '@/lib/catalog-strip'
import { cn } from '@/lib/utils'
import { useDeleteCategoryMutation, type Category } from '@/queries'
import type { UseQueryResult } from '@tanstack/react-query'
import { AdminAddTile } from './AdminAddTile'
import { HorizontalScroller } from './HorizontalScroller'
import { ShowAllTile, StripOrWrap } from './ShowAll'

type CategoryChipsProps = {
  query: UseQueryResult<Category[]>
  selectedId?: number
  onSelect: (id: number | undefined) => void
  isAdmin: boolean
}

export function CategoryChips({
  query,
  selectedId,
  onSelect,
  isAdmin,
}: CategoryChipsProps) {
  const deleteMutation = useDeleteCategoryMutation()
  const [editId, setEditId] = useState<number>()
  const [deleting, setDeleting] = useState<Category>()
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const editing = (query.data ?? []).find((item) => item.id === editId)
  const needle = search.trim().toLowerCase()

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Категория</h2>
          <p className="text-sm text-muted-foreground">Выберите категорию</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Найти категорию"
              aria-label="Найти категорию"
              className="h-9 pl-8"
            />
          </div>
          {expanded && !needle ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              Свернуть
            </Button>
          ) : null}
        </div>
      </div>
      <QueryStatus
        query={query}
        isEmpty={(items) => items.length === 0 && !isAdmin}
        emptyMessage="Категорий пока нет"
        skeleton={
          <HorizontalScroller>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-8 w-24 shrink-0 rounded-full" />
            ))}
          </HorizontalScroller>
        }
      >
        {(categories) => {
          const matched = needle
            ? categories.filter((category) => category.name.toLowerCase().includes(needle))
            : categories
          const { items: preview, hasMore } = previewStrip(matched, selectedId)
          const showAllMatches = Boolean(needle)
          const visible = expanded || showAllMatches ? matched : preview
          return (
            <div className="space-y-2">
              <StripOrWrap expanded={expanded || showAllMatches} className="gap-2">
                <AdminAddTile
                  isAdmin={isAdmin}
                  to="/admin/new/category"
                  label="Новая категория"
                  variant="chip"
                />
                <AllCategoriesChip
                  selected={selectedId === undefined}
                  onSelect={() => onSelect(undefined)}
                />
                {visible.map((category) => (
                  <CategoryChip
                    key={category.id}
                    category={category}
                    selected={selectedId === category.id}
                    onSelect={onSelect}
                    isAdmin={isAdmin}
                    onEdit={() => setEditId(category.id)}
                    onDelete={() => {
                      deleteMutation.reset()
                      setDeleting(category)
                    }}
                  />
                ))}
                {!expanded && !showAllMatches && hasMore ? (
                  <ShowAllTile
                    variant="chip"
                    total={matched.length}
                    onClick={() => setExpanded(true)}
                  />
                ) : null}
              </StripOrWrap>
              {showAllMatches && matched.length === 0 ? (
                <p className="text-sm text-muted-foreground">Категорий не найдено</p>
              ) : null}
            </div>
          )
        }}
      </QueryStatus>
      <EditCategoryDialog
        category={editing}
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
        title="Удалить категорию?"
        description="Если к категории привязаны запчасти, удалить её нельзя."
        pending={deleteMutation.isPending}
        error={deleteMutation.error}
        onConfirm={() => {
          if (!deleting) {
            return
          }
          deleteMutation.mutate(deleting.id, {
            onSuccess: () => {
              toast.success('Категория удалена')
              setDeleting(undefined)
            },
          })
        }}
      />
    </section>
  )
}

function AllCategoriesChip({
  selected,
  onSelect,
}: {
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      Все
    </button>
  )
}

function CategoryChip({
  category,
  selected,
  onSelect,
  isAdmin,
  onEdit,
  onDelete,
}: {
  category: Category
  selected: boolean
  onSelect: (id: number | undefined) => void
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => onSelect(selected ? undefined : category.id)}
        className={cn(
          'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        {category.name}
      </button>
      <AdminKebab
        isAdmin={isAdmin}
        className="bg-transparent"
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}

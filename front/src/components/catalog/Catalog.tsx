import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  compactCatalogSearch,
  paginateCatalog,
  type CatalogSearch,
} from '@/lib/catalog-search'
import { catalogPartsForView } from '@/lib/format'
import {
  useCategoriesQuery,
  useIsAdmin,
  useMarksQuery,
  useModelsQuery,
  useSparePartsQuery,
} from '@/queries'
import { useCatalogHydrated, useCatalogStore } from '@/stores'
import {
  CatalogPartsSkeleton,
  CategoryChipsSkeleton,
  StripTilesSkeleton,
} from '@/components/query-skeletons'
import { CategoryChips } from './CategoryChips'
import { MarksStrip } from './MarksStrip'
import { ModelsStrip } from './ModelsStrip'
import { SparePartsGrid } from './SparePartsGrid'

export function Catalog() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const isAdmin = useIsAdmin()
  const catalogHydrated = useCatalogHydrated()
  const hydratedFromStore = useRef(false)
  const replaceSelection = useCatalogStore((state) => state.replace)
  const marksQuery = useMarksQuery()
  const modelsQuery = useModelsQuery()
  const categoriesQuery = useCategoriesQuery()
  const partsQuery = useSparePartsQuery()

  const parts = partsQuery.data
  const marks = marksQuery.data ?? []
  const markId = search.markId
  const modelId = search.modelId
  const categoryId = search.categoryId
  const carReady = Boolean(markId && modelId)
  const showGrid = carReady
  const filters: CatalogSearch = useMemo(
    () => ({
      markId,
      modelId,
      categoryId,
    }),
    [categoryId, markId, modelId],
  )
  const { matched: visibleParts, suggested: suggestedParts } = useMemo(
    () => catalogPartsForView(parts ?? [], filters),
    [filters, parts],
  )
  const paged = paginateCatalog(visibleParts, search.page)

  useEffect(() => {
    if (!catalogHydrated || hydratedFromStore.current) {
      return
    }
    hydratedFromStore.current = true
    if (search.markId || search.modelId || search.categoryId) {
      replaceSelection({
        markId: search.markId,
        modelId: search.modelId,
        categoryId: search.categoryId,
      })
      return
    }
    const stored = useCatalogStore.getState()
    if (!stored.markId && !stored.modelId && !stored.categoryId) {
      return
    }
    void navigate({
      search: (prev) =>
        compactCatalogSearch({
          ...prev,
          markId: stored.markId,
          modelId: stored.modelId,
          categoryId: stored.categoryId,
        }),
      replace: true,
      resetScroll: false,
    })
  }, [
    catalogHydrated,
    navigate,
    replaceSelection,
    search.categoryId,
    search.markId,
    search.modelId,
  ])

  const patchCatalog = useCallback(
    (patch: Partial<CatalogSearch>) => {
      const next = compactCatalogSearch({
        ...search,
        ...patch,
        ...('page' in patch ? {} : { page: undefined }),
      })
      replaceSelection({
        markId: next.markId,
        modelId: next.modelId,
        categoryId: next.categoryId,
      })
      void navigate({
        search: next,
        hash: 'catalog',
        replace: true,
        resetScroll: false,
        hashScrollIntoView: 'page' in patch,
      })
    },
    [navigate, replaceSelection, search],
  )

  useEffect(() => {
    if (!markId || !marksQuery.data) {
      return
    }
    if (!marksQuery.data.some((mark) => mark.id === markId)) {
      patchCatalog({ markId: undefined, modelId: undefined })
    }
  }, [markId, marksQuery.data, patchCatalog])

  useEffect(() => {
    if (!modelId || !markId || !modelsQuery.data) {
      return
    }
    const belongs = modelsQuery.data.some(
      (model) => model.id === modelId && model.markId === markId,
    )
    if (!belongs) {
      patchCatalog({ modelId: undefined })
    }
  }, [markId, modelId, modelsQuery.data, patchCatalog])

  useEffect(() => {
    if (!categoryId || !categoriesQuery.data) {
      return
    }
    if (!categoriesQuery.data.some((category) => category.id === categoryId)) {
      patchCatalog({ categoryId: undefined })
    }
  }, [categoriesQuery.data, categoryId, patchCatalog])

  useEffect(() => {
    if (!showGrid || paged.page === (search.page ?? 1)) {
      return
    }
    patchCatalog({ page: paged.page === 1 ? undefined : paged.page })
  }, [paged.page, patchCatalog, search.page, showGrid])

  return (
    <div className="space-y-10">
      <MarksStrip
        query={marksQuery}
        selectedId={markId}
        isAdmin={isAdmin}
        onSelect={(id) => patchCatalog({ markId: id, modelId: undefined })}
      />
      {markId ? (
        <ModelsStrip
          key={markId}
          query={modelsQuery}
          markId={markId}
          selectedId={modelId}
          isAdmin={isAdmin}
          onSelect={(id) => patchCatalog({ modelId: id })}
        />
      ) : marksQuery.isPending ? null : (
        <p className="text-sm text-muted-foreground">Выберите марку, чтобы увидеть модели</p>
      )}
      {markId && !modelId && !modelsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Выберите модель, чтобы увидеть категории</p>
      ) : null}
      {showGrid ? (
        <>
          <CategoryChips
            query={categoriesQuery}
            selectedId={categoryId}
            isAdmin={isAdmin}
            onSelect={(id) => patchCatalog({ categoryId: id })}
          />
          <SparePartsGrid
            query={partsQuery}
            parts={paged.items}
            suggestedParts={carReady && paged.page === 1 ? suggestedParts : []}
            marks={marks}
            models={modelsQuery.data ?? []}
            isAdmin={isAdmin}
            filteredEmpty={visibleParts.length === 0}
            onResetFilters={() => {
              useCatalogStore.getState().clear()
              patchCatalog({
                markId: undefined,
                modelId: undefined,
                categoryId: undefined,
                page: undefined,
              })
            }}
            page={paged.page}
            totalPages={paged.totalPages}
            onPage={(page) => patchCatalog({ page: page === 1 ? undefined : page })}
          />
        </>
      ) : null}
    </div>
  )
}

export function CatalogPending({
  markId,
  modelId,
}: {
  markId?: number
  modelId?: number
}) {
  const showGrid = Boolean(markId && modelId)

  return (
    <div className="space-y-10" aria-busy="true" aria-live="polite">
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Марка</h2>
          <p className="text-sm text-muted-foreground">Выберите марку</p>
        </div>
        <StripTilesSkeleton />
      </section>
      {markId ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Модель</h2>
            <p className="text-sm text-muted-foreground">Выберите модель</p>
          </div>
          <StripTilesSkeleton />
        </section>
      ) : null}
      {showGrid ? (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Категория</h2>
              <p className="text-sm text-muted-foreground">Выберите категорию</p>
            </div>
            <CategoryChipsSkeleton />
          </section>
          <CatalogPartsSkeleton />
        </>
      ) : null}
    </div>
  )
}

import { useNavigate, useRouterState, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { JsonLd } from '@/components/JsonLd'
import { CatalogPolyhedron } from '@/components/layout/ScatteredParts'
import {
  catalogNav,
  catalogPath,
  findMarkBySlug,
  findModelBySlug,
  parseCatalogPath,
} from '@/lib/catalog-path'
import {
  compactCatalogSearch,
  paginateCatalog,
  type CatalogSearch,
} from '@/lib/catalog-search'
import { catalogPartsForView } from '@/lib/format'
import { breadcrumbJsonLd, catalogJsonLd } from '@/lib/seo'
import {
  useCategoriesQuery,
  useIsAdmin,
  useMarksQuery,
  useModelsQuery,
  useSparePartsQuery,
} from '@/queries'
import { useCatalogHydrated, useCatalogStore } from '@/stores'
import { CategoryChips } from './CategoryChips'
import { MarksStrip } from './MarksStrip'
import { ModelsStrip } from './ModelsStrip'
import { SparePartsGrid } from './SparePartsGrid'

type CatalogProps = {
  showHeading?: boolean
}

export function Catalog({ showHeading = false }: CatalogProps = {}) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { markSlug, modelSlug } = parseCatalogPath(pathname)
  const search = useSearch({ strict: false }) as CatalogSearch
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
  const models = modelsQuery.data ?? []
  const mark = markSlug ? findMarkBySlug(marks, markSlug) : undefined
  const model = mark && modelSlug ? findModelBySlug(models, mark.id, modelSlug) : undefined
  const markId = mark?.id
  const modelId = model?.id
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

  const patchCatalog = useCallback(
    (patch: Partial<CatalogSearch>) => {
      const next = compactCatalogSearch({
        markId,
        modelId,
        categoryId,
        page: search.page,
        ...patch,
        ...('page' in patch ? {} : { page: undefined }),
      })
      const nextMark = marks.find((item) => item.id === next.markId)
      const nextModel = models.find((item) => item.id === next.modelId)
      replaceSelection({
        markId: next.markId,
        modelId: next.modelId,
        categoryId: next.categoryId,
      })
      const nav = catalogNav({
        mark: nextMark,
        model: nextMark ? nextModel : undefined,
        marks,
        models,
        categoryId: next.categoryId,
        page: next.page,
      })
      void navigate({
        to: nav.to,
        params: nav.params,
        search: nav.search ?? {},
        replace: true,
        resetScroll: false,
        hashScrollIntoView: 'page' in patch,
      } as never)
    },
    [
      categoryId,
      markId,
      marks,
      modelId,
      models,
      navigate,
      replaceSelection,
      search.page,
    ],
  )

  useEffect(() => {
    if (!catalogHydrated || hydratedFromStore.current) {
      return
    }
    if (markId || modelId || categoryId || search.markId || search.modelId) {
      hydratedFromStore.current = true
      replaceSelection({
        markId: markId ?? search.markId,
        modelId: modelId ?? search.modelId,
        categoryId,
      })
      return
    }
    // Главную не трогаем: иначе persist уводит с `/` на `/catalog/{mark}` и hero пропадает.
    if (pathname !== '/catalog' && pathname !== '/catalog/') {
      return
    }
    if (!marksQuery.data) {
      return
    }
    hydratedFromStore.current = true
    const stored = useCatalogStore.getState()
    if (!stored.markId && !stored.modelId && !stored.categoryId) {
      return
    }
    patchCatalog({
      markId: stored.markId,
      modelId: stored.modelId,
      categoryId: stored.categoryId,
    })
  }, [
    catalogHydrated,
    marksQuery.data,
    search.categoryId,
    search.markId,
    search.modelId,
    markId,
    modelId,
    categoryId,
    patchCatalog,
    pathname,
    replaceSelection,
  ])

  useEffect(() => {
    if (!markSlug || !marksQuery.data) {
      return
    }
    if (!mark) {
      patchCatalog({ markId: undefined, modelId: undefined })
    }
  }, [mark, markSlug, marksQuery.data, patchCatalog])

  useEffect(() => {
    if (!modelSlug || !markId || !modelsQuery.data) {
      return
    }
    if (!model) {
      patchCatalog({ modelId: undefined })
    }
  }, [markId, model, modelSlug, modelsQuery.data, patchCatalog])

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
    <div className="relative flex flex-1 flex-col">
      <div className="relative z-10 flex-1 space-y-10">
        {showHeading ? (
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl">
              {mark && model
                ? `Запчасти ${mark.name} ${model.name}`
                : mark
                  ? `Запчасти ${mark.name}`
                  : 'Каталог автозапчастей'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Оригинальные и проверенные компоненты. Подбор в Грозном и по Чеченской Республике.
            </p>
          </div>
        ) : null}
        {showGrid ? null : <CatalogPolyhedron />}
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
      {showHeading ? (
        <>
          {parts && parts.length > 0 ? (
            <JsonLd data={catalogJsonLd(showGrid ? visibleParts : parts)} />
          ) : null}
          <JsonLd
            data={breadcrumbJsonLd([
              { name: 'Каталог', path: '/catalog' },
              ...(mark
                ? [{ name: mark.name, path: catalogPath({ mark, marks }) }]
                : []),
              ...(mark && model
                ? [{ name: model.name, path: catalogPath({ mark, model, marks, models }) }]
                : []),
            ])}
          />
        </>
      ) : null}
      </div>
    </div>
  )
}

export function CatalogSection() {
  return (
    <section
      id="catalog"
      className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl scroll-mt-16 flex-col px-4 py-12"
    >
      <Catalog showHeading />
    </section>
  )
}

import { CatalogPolyhedron } from '@/components/layout/ScatteredParts'
import {
  CatalogPartsSkeleton,
  CategoryChipsSkeleton,
  StripTilesSkeleton,
} from '@/components/query-skeletons'

export function CatalogPending({
  markId,
  modelId,
}: {
  markId?: number
  modelId?: number
}) {
  const showGrid = Boolean(markId && modelId)

  return (
    <div className="relative flex flex-1 flex-col" aria-busy="true" aria-live="polite">
      <span className="sr-only">Загрузка каталога</span>
      <div className="relative z-10 flex-1 space-y-10">
        {showGrid ? null : <CatalogPolyhedron />}
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
            <StripTilesSkeleton rows={2} />
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
    </div>
  )
}

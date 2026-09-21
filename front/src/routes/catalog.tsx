import { lazy, Suspense, type ReactNode } from 'react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { CatalogPending } from '@/components/catalog/CatalogPending'
import { JsonLd } from '@/components/JsonLd'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { validateCatalogPageSearch } from '@/lib/catalog-search'
import { storeJsonLd } from '@/lib/seo'

const CatalogSection = lazy(() =>
  import('@/components/catalog/Catalog').then((module) => ({ default: module.CatalogSection })),
)

export const Route = createFileRoute('/catalog')({
  validateSearch: validateCatalogPageSearch,
  loader: () => ensureCatalogQueries(),
  pendingComponent: CatalogLayoutPending,
  component: CatalogLayout,
})

function CatalogShell({ children }: { children: ReactNode }) {
  return (
    <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-4 py-12">
      {children}
    </section>
  )
}

function CatalogLayoutPending() {
  return (
    <CatalogShell>
      <CatalogPending />
    </CatalogShell>
  )
}

function CatalogLayout() {
  return (
    <>
      <Suspense fallback={<CatalogLayoutPending />}>
        <CatalogSection />
      </Suspense>
      <JsonLd data={storeJsonLd()} />
      <Outlet />
    </>
  )
}

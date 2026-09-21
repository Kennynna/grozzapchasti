import { Outlet, createFileRoute } from '@tanstack/react-router'
import { CatalogPending, CatalogSection } from '@/components/catalog/Catalog'
import { JsonLd } from '@/components/JsonLd'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { validateCatalogPageSearch } from '@/lib/catalog-search'
import { storeJsonLd } from '@/lib/seo'

export const Route = createFileRoute('/catalog')({
  validateSearch: validateCatalogPageSearch,
  loader: () => ensureCatalogQueries(),
  pendingComponent: CatalogLayoutPending,
  component: CatalogLayout,
})

function CatalogLayoutPending() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-4 py-12">
      <CatalogPending />
    </section>
  )
}

function CatalogLayout() {
  return (
    <>
      <CatalogSection />
      <JsonLd data={storeJsonLd()} />
      <Outlet />
    </>
  )
}

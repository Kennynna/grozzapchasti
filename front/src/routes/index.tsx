import { createFileRoute } from '@tanstack/react-router'
import { Catalog, CatalogPending } from '@/components/catalog/Catalog'
import { HomeHero } from '@/components/home/HomeHero'
import { site } from '@/config/site'
import { validateCatalogSearch } from '@/lib/catalog-search'
import {
  categoriesQueries,
  marksQueries,
  modelsQueries,
  queryClient,
  sparePartsQueries,
} from '@/queries'

export const Route = createFileRoute('/')({
  validateSearch: validateCatalogSearch,
  pendingMs: 0,
  pendingComponent: HomePending,
  loader: () =>
    Promise.all([
      queryClient.ensureQueryData(marksQueries.list()),
      queryClient.ensureQueryData(modelsQueries.list()),
      queryClient.ensureQueryData(categoriesQueries.list()),
      queryClient.ensureQueryData(sparePartsQueries.list()),
    ]),
  head: () => ({
    meta: [
      { title: site.name },
      { name: 'description', content: site.description },
    ],
  }),
  component: HomePage,
})

function HomePending() {
  const search = Route.useSearch()
  return (
    <>
      <HomeHero />
      <section
        id="catalog"
        className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl scroll-mt-16 flex-col px-4 py-12"
      >
        <CatalogPending markId={search.markId} modelId={search.modelId} />
      </section>
    </>
  )
}

function HomePage() {
  return (
    <>
      <HomeHero />
      <section
        id="catalog"
        className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl scroll-mt-16 flex-col px-4 py-12"
      >
        <Catalog />
      </section>
    </>
  )
}

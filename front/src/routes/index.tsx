import { createFileRoute } from '@tanstack/react-router'
import { Catalog, CatalogPending } from '@/components/catalog/Catalog'
import { Assurances } from '@/components/home/Assurances'
import { HomeHero } from '@/components/home/HomeHero'
import { HowToOrder } from '@/components/home/HowToOrder'
import { JsonLd } from '@/components/JsonLd'
import { site } from '@/config/site'
import { validateCatalogSearch } from '@/lib/catalog-search'
import { catalogJsonLd, canonical, faqJsonLd, pageMeta, storeJsonLd } from '@/lib/seo'
import {
  categoriesQueries,
  marksQueries,
  modelsQueries,
  queryClient,
  sparePartsQueries,
  useSparePartsQuery,
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
    meta: pageMeta({
      title: `${site.heroTitle} в Грозном · ${site.name}`,
      path: '/',
    }),
    links: canonical('/'),
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
      <HowToOrder />
      <Assurances />
    </>
  )
}

function HomePage() {
  const partsQuery = useSparePartsQuery()

  return (
    <>
      <HomeHero />
      <section
        id="catalog"
        className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl scroll-mt-16 flex-col px-4 py-12"
      >
        <Catalog />
      </section>
      <HowToOrder />
      <Assurances />
      <JsonLd data={storeJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      {partsQuery.data && partsQuery.data.length > 0 ? (
        <JsonLd data={catalogJsonLd(partsQuery.data)} />
      ) : null}
    </>
  )
}

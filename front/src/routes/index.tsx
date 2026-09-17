import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Catalog, CatalogPending } from '@/components/catalog/Catalog'
import { Assurances } from '@/components/home/Assurances'
import { HomeHero } from '@/components/home/HomeHero'
import { HowToOrder } from '@/components/home/HowToOrder'
import { JsonLd } from '@/components/JsonLd'
import { site } from '@/config/site'
import { catalogNav } from '@/lib/catalog-path'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { validateCatalogSearch } from '@/lib/catalog-search'
import { catalogJsonLd, canonical, faqJsonLd, pageMeta, storeJsonLd } from '@/lib/seo'
import { useMarksQuery, useModelsQuery, useSparePartsQuery } from '@/queries'

export const Route = createFileRoute('/')({
  validateSearch: validateCatalogSearch,
  pendingMs: 0,
  pendingComponent: HomePending,
  loader: () => ensureCatalogQueries(),
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
  return (
    <>
      <HomeHero />
      <section
        id="catalog"
        className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl scroll-mt-16 flex-col px-4 py-12"
      >
        <CatalogPending />
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
      <LegacyCatalogRedirect />
      <HomeHero />
      <section
        id="catalog"
        className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl scroll-mt-16 flex-col px-4 py-12"
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

function LegacyCatalogRedirect() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const marksQuery = useMarksQuery()
  const modelsQuery = useModelsQuery()

  useEffect(() => {
    if (!search.markId || !marksQuery.data) {
      return
    }
    const mark = marksQuery.data.find((item) => item.id === search.markId)
    if (!mark) {
      return
    }
    const model = search.modelId
      ? modelsQuery.data?.find((item) => item.id === search.modelId && item.markId === mark.id)
      : undefined
    const nav = catalogNav({
      mark,
      model,
      marks: marksQuery.data,
      models: modelsQuery.data ?? [],
      categoryId: search.categoryId,
      page: search.page,
    })
    void navigate({
      to: nav.to,
      params: nav.params,
      search: nav.search ?? {},
      replace: true,
    } as never)
  }, [
    marksQuery.data,
    modelsQuery.data,
    navigate,
    search.categoryId,
    search.markId,
    search.modelId,
    search.page,
  ])

  return null
}


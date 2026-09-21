import { lazy, Suspense, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { HomeHero } from '@/components/home/HomeHero'
import { JsonLd } from '@/components/JsonLd'
import { site } from '@/config/site'
import { catalogNav } from '@/lib/catalog-path'
import { validateCatalogSearch } from '@/lib/catalog-search'
import { canonical, faqJsonLd, pageMeta, storeJsonLd } from '@/lib/seo'
import { marksQueries, modelsQueries } from '@/queries'

const HowToOrder = lazy(() =>
  import('@/components/home/HowToOrder').then((module) => ({ default: module.HowToOrder })),
)
const Assurances = lazy(() =>
  import('@/components/home/Assurances').then((module) => ({ default: module.Assurances })),
)

export const Route = createFileRoute('/')({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: pageMeta({
      title: `${site.heroTitle} в Грозном · ${site.name}`,
      path: '/',
    }),
    links: canonical('/'),
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <LegacyCatalogRedirect />
      <HomeHero />
      <Suspense fallback={<div className="min-h-112" aria-hidden />}>
        <HowToOrder />
      </Suspense>
      <Suspense fallback={<div className="min-h-96" aria-hidden />}>
        <Assurances />
      </Suspense>
      <JsonLd data={storeJsonLd()} />
      <JsonLd data={faqJsonLd()} />
    </>
  )
}

function LegacyCatalogRedirect() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const hasLegacy = Boolean(search.markId)
  const marksQuery = useQuery({
    ...marksQueries.list(),
    enabled: hasLegacy,
  })
  const modelsQuery = useQuery({
    ...modelsQueries.list(),
    enabled: hasLegacy,
  })

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

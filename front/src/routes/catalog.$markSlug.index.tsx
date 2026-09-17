import { createFileRoute, notFound } from '@tanstack/react-router'
import { CatalogPending, CatalogSection } from '@/components/catalog/Catalog'
import { JsonLd } from '@/components/JsonLd'
import { site } from '@/config/site'
import { findMarkBySlug } from '@/lib/catalog-path'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { canonical, pageMeta, storeJsonLd } from '@/lib/seo'

export const Route = createFileRoute('/catalog/$markSlug/')({
  pendingMs: 0,
  pendingComponent: CatalogMarkPending,
  loader: async ({ params }) => {
    const [marks] = await ensureCatalogQueries()
    const mark = findMarkBySlug(marks, params.markSlug)
    if (!mark) {
      throw notFound()
    }
    return { mark }
  },
  head: ({ loaderData, params }) => {
    const markName = loaderData?.mark.name ?? params.markSlug
    const path = `/catalog/${params.markSlug}`
    return {
      meta: pageMeta({
        title: `Запчасти ${markName} в Грозном · ${site.name}`,
        description: `Купить автозапчасти ${markName} в Грозном. Подбор по модели, оригинальные и проверенные компоненты, заказ в WhatsApp.`,
        path,
        keywords: `запчасти ${markName} Грозный, ${site.keywords}`,
      }),
      links: canonical(path),
    }
  },
  component: CatalogMarkPage,
})

function CatalogMarkPending() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-4 py-12">
      <CatalogPending markId={1} />
    </section>
  )
}

function CatalogMarkPage() {
  const { markSlug } = Route.useParams()
  return (
    <>
      <CatalogSection markSlug={markSlug} />
      <JsonLd data={storeJsonLd()} />
    </>
  )
}

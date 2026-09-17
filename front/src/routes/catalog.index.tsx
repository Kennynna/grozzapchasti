import { createFileRoute } from '@tanstack/react-router'
import { CatalogPending, CatalogSection } from '@/components/catalog/Catalog'
import { JsonLd } from '@/components/JsonLd'
import { site } from '@/config/site'
import { canonical, pageMeta, storeJsonLd } from '@/lib/seo'

export const Route = createFileRoute('/catalog/')({
  pendingMs: 0,
  pendingComponent: CatalogIndexPending,
  head: () => ({
    meta: pageMeta({
      title: `Каталог автозапчастей в Грозном · ${site.name}`,
      description:
        'Каталог оригинальных автозапчастей в Грозном. Подбор по марке и модели автомобиля, заказ в WhatsApp.',
      path: '/catalog',
      keywords: `каталог автозапчастей Грозный, ${site.keywords}`,
    }),
    links: canonical('/catalog'),
  }),
  component: CatalogIndexPage,
})

function CatalogIndexPending() {
  return (
    <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col px-4 py-12">
      <CatalogPending />
    </section>
  )
}

function CatalogIndexPage() {
  return (
    <>
      <CatalogSection />
      <JsonLd data={storeJsonLd()} />
    </>
  )
}

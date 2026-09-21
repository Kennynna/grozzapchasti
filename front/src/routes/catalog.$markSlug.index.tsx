import { createFileRoute, notFound } from '@tanstack/react-router'
import { site } from '@/config/site'
import { findMarkBySlug } from '@/lib/catalog-path'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { canonical, pageMeta } from '@/lib/seo'

export const Route = createFileRoute('/catalog/$markSlug/')({
  pendingComponent: () => null,
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
  component: () => null,
})

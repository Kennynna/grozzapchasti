import { createFileRoute, notFound } from '@tanstack/react-router'
import { site } from '@/config/site'
import { findMarkBySlug, findModelBySlug } from '@/lib/catalog-path'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { canonical, pageMeta } from '@/lib/seo'

export const Route = createFileRoute('/catalog/$markSlug/$modelSlug')({
  pendingComponent: () => null,
  loader: async ({ params }) => {
    const [marks, models] = await ensureCatalogQueries()
    const mark = findMarkBySlug(marks, params.markSlug)
    const model = mark
      ? findModelBySlug(models, mark.id, params.modelSlug)
      : undefined
    if (!mark || !model) {
      throw notFound()
    }
    return { mark, model }
  },
  head: ({ loaderData, params }) => {
    const markName = loaderData?.mark.name ?? params.markSlug
    const modelName = loaderData?.model.name ?? params.modelSlug
    const path = `/catalog/${params.markSlug}/${params.modelSlug}`
    return {
      meta: pageMeta({
        title: `Запчасти ${markName} ${modelName} в Грозном · ${site.name}`,
        description: `Купить автозапчасти ${markName} ${modelName} в Грозном. Оригинальные и проверенные компоненты, заказ в WhatsApp.`,
        path,
        keywords: `запчасти ${markName} ${modelName} Грозный, ${site.keywords}`,
      }),
      links: canonical(path),
    }
  },
  component: () => null,
})

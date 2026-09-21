import { createFileRoute } from '@tanstack/react-router'
import { site } from '@/config/site'
import { canonical, pageMeta } from '@/lib/seo'

export const Route = createFileRoute('/catalog/')({
  pendingComponent: () => null,
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
  component: () => null,
})

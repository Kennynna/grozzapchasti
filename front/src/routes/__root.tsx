import { HeadContent, Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { type ReactNode, useEffect } from 'react'
import { RobotsMeta } from '@/components/JsonLd'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SiteWideParts } from '@/components/layout/ScatteredParts'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import { dropStaticOgTags } from '@/lib/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: site.name },
      { name: 'description', content: site.description },
    ],
  }),
  component: RootLayout,
  errorComponent: RootError,
  notFoundComponent: NotFound,
})

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background">
      <HeadContent />
      <SiteWideParts />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function RootError({ error }: { error: Error }) {
  return (
    <Shell>
      <RobotsMeta content="noindex, nofollow" />
      <div className="relative min-h-[50vh] overflow-x-clip">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <h1 className="text-2xl">Не удалось показать страницу</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-6" variant="outline" asChild>
          <Link to="/">На главную</Link>
        </Button>
        </div>
      </div>
    </Shell>
  )
}

function NotFound() {
  return (
    <div className="relative min-h-[50vh] overflow-x-clip">
      <RobotsMeta content="noindex, nofollow" />
      <div className="relative mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl">Страница не найдена</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Такой страницы нет. Вернитесь в каталог и выберите запчасть.
      </p>
      <Button className="mt-6" variant="outline" asChild>
        <Link to="/catalog">
          В каталог
        </Link>
      </Button>
      </div>
    </div>
  )
}

function RootLayout() {
  useEffect(() => {
    dropStaticOgTags()
  }, [])

  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

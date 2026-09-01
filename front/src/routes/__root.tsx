import { HeadContent, Link, Outlet, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

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
    <div className="flex min-h-svh flex-col bg-background">
      <HeadContent />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function RootError({ error }: { error: Error }) {
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-2xl">Не удалось показать страницу</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-6" variant="outline" asChild>
          <Link to="/">На главную</Link>
        </Button>
      </div>
    </Shell>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl">Страница не найдена</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Такой страницы нет. Вернитесь в каталог и выберите запчасть.
      </p>
      <Button className="mt-6" variant="outline" asChild>
        <Link to="/" hash="catalog">
          В каталог
        </Link>
      </Button>
    </div>
  )
}

function RootLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

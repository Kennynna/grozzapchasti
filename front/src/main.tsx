import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { queryClient } from '@/queries'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 30_000,
  // Не показывать pending, пока loader не задержался: иначе клик по марке/модели
  // сразу сносит каталог в скелетон. pendingMinMs: 0 — не держать скелетон искусственно.
  defaultPendingMs: 300,
  defaultPendingMinMs: 0,
  defaultPendingComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-16" aria-busy="true">
      <span className="sr-only">Загрузка страницы</span>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)

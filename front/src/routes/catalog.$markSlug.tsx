import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/catalog/$markSlug')({
  component: CatalogMarkLayout,
})

function CatalogMarkLayout() {
  return <Outlet />
}

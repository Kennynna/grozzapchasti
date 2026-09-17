import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ensureCatalogQueries } from '@/lib/catalog-data'
import { validateCatalogPageSearch } from '@/lib/catalog-search'

export const Route = createFileRoute('/catalog')({
  validateSearch: validateCatalogPageSearch,
  loader: () => ensureCatalogQueries(),
  component: CatalogLayout,
})

function CatalogLayout() {
  return <Outlet />
}

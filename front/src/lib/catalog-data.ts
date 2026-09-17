import {
  categoriesQueries,
  marksQueries,
  modelsQueries,
  queryClient,
  sparePartsQueries,
} from '@/queries'

export function ensureCatalogQueries() {
  return Promise.all([
    queryClient.ensureQueryData(marksQueries.list()),
    queryClient.ensureQueryData(modelsQueries.list()),
    queryClient.ensureQueryData(categoriesQueries.list()),
    queryClient.ensureQueryData(sparePartsQueries.list()),
  ])
}

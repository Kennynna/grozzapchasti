export type CatalogSearch = {
  markId?: number
  modelId?: number
  categoryId?: number
  page?: number
}

export const CATALOG_PAGE_SIZE = 14

export function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const parsed = Number(value)
    if (parsed > 0) {
      return parsed
    }
  }
  return undefined
}

export function validateCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const markId = parsePositiveInt(search.markId)
  return {
    markId,
    modelId: markId ? parsePositiveInt(search.modelId) : undefined,
    categoryId: parsePositiveInt(search.categoryId),
    page: parsePositiveInt(search.page),
  }
}

export function compactCatalogSearch(search: CatalogSearch): CatalogSearch {
  const next: CatalogSearch = {}
  if (search.markId) {
    next.markId = search.markId
  }
  if (search.markId && search.modelId) {
    next.modelId = search.modelId
  }
  if (search.categoryId) {
    next.categoryId = search.categoryId
  }
  if (search.page && search.page > 1) {
    next.page = search.page
  }
  return next
}

export function hasCatalogFilters(search: CatalogSearch) {
  return Boolean(search.markId || search.modelId || search.categoryId)
}

export function paginateCatalog<T>(items: T[], page: number | undefined, pageSize = CATALOG_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, page ?? 1), totalPages)
  const start = (current - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
  }
}

import type { SparePart } from '@/queries'
import type { CatalogSearch } from './catalog-search'

const priceFormatter = new Intl.NumberFormat('ru-RU')

export function formatPrice(rubles: number) {
  return `${priceFormatter.format(rubles)} ₽`
}

/** Основная сетка: только точное авто. Универсальные туда не попадают. */
export function filterSpareParts(parts: SparePart[], search: CatalogSearch) {
  return parts.filter((part) => {
    if (search.markId || search.modelId) {
      if (part.markId !== (search.markId ?? null)) {
        return false
      }
      if (search.modelId && part.modelId !== search.modelId) {
        return false
      }
    }
    if (search.categoryId && part.categoryId !== search.categoryId) {
      return false
    }
    return true
  })
}

function fitsSuggestion(part: SparePart, search: CatalogSearch) {
  if (!part.markId && !part.modelId) {
    return true
  }
  if (search.markId && part.markId === search.markId && !part.modelId) {
    return true
  }
  if (
    search.categoryId &&
    search.markId &&
    search.modelId &&
    part.markId === search.markId &&
    part.modelId === search.modelId &&
    part.categoryId !== search.categoryId
  ) {
    return true
  }
  return false
}

/** Универсальные и «все модели марки» — в «Возможно, вам понадобится». */
export function catalogPartsForView(parts: SparePart[], search: CatalogSearch) {
  const matched = filterSpareParts(parts, search)
  if (!search.markId || !search.modelId) {
    return { matched, suggested: [] as SparePart[] }
  }

  const matchedIds = new Set(matched.map((part) => part.id))
  const suggested = parts.filter((part) => {
    if (matchedIds.has(part.id)) {
      return false
    }
    if (search.categoryId && part.categoryId === search.categoryId && part.markId && part.modelId) {
      return false
    }
    return fitsSuggestion(part, search)
  })
  return { matched, suggested }
}

/** Соседние товары на странице запчасти: то же авто, универсальные, та же категория. */
export function relatedPartsFor(part: SparePart, parts: SparePart[], limit = 6) {
  const others = parts.filter((item) => item.id !== part.id)
  if (part.markId && part.modelId) {
    const { matched, suggested } = catalogPartsForView(others, {
      markId: part.markId,
      modelId: part.modelId,
      categoryId: part.categoryId,
    })
    return [...matched, ...suggested].slice(0, limit)
  }
  if (part.markId) {
    const sameMark = others.filter((item) => item.markId === part.markId)
    const universals = others.filter((item) => !item.markId)
    return [...sameMark, ...universals].slice(0, limit)
  }
  const universals = others.filter((item) => !item.markId)
  const sameCategory = universals.filter((item) => item.categoryId === part.categoryId)
  const rest = universals.filter((item) => item.categoryId !== part.categoryId)
  return [...sameCategory, ...rest].slice(0, limit)
}

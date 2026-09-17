import type { CatalogSearch } from '@/lib/catalog-search'
import { uniqueSlug } from '@/lib/slug'
import type { Mark, Model } from '@/queries'

export function markSlugOf(mark: Mark, marks: Mark[]) {
  return uniqueSlug(mark.name, mark.id, marks)
}

export function modelSlugOf(model: Model, models: Model[]) {
  const ofMark = models.filter((item) => item.markId === model.markId)
  return uniqueSlug(model.name, model.id, ofMark)
}

export function findMarkBySlug(marks: Mark[], slug: string) {
  return marks.find((mark) => markSlugOf(mark, marks) === slug)
}

export function findModelBySlug(models: Model[], markId: number, slug: string) {
  const ofMark = models.filter((item) => item.markId === markId)
  return ofMark.find((model) => uniqueSlug(model.name, model.id, ofMark) === slug)
}

export function catalogPath(options: {
  mark?: Mark
  model?: Model
  marks?: Mark[]
  models?: Model[]
}) {
  const { mark, model, marks = [], models = [] } = options
  if (!mark) {
    return '/catalog'
  }
  const markSlug = markSlugOf(mark, marks)
  if (!model) {
    return `/catalog/${markSlug}`
  }
  return `/catalog/${markSlug}/${modelSlugOf(model, models)}`
}

export type CatalogNav = {
  to: '/catalog' | '/catalog/$markSlug' | '/catalog/$markSlug/$modelSlug'
  params?: { markSlug: string; modelSlug?: string }
  search?: Pick<CatalogSearch, 'categoryId' | 'page'>
}

export function catalogNav(options: {
  mark?: Mark
  model?: Model
  marks: Mark[]
  models: Model[]
  categoryId?: number
  page?: number
}): CatalogNav {
  const search: CatalogNav['search'] = {}
  if (options.categoryId) {
    search.categoryId = options.categoryId
  }
  if (options.page && options.page > 1) {
    search.page = options.page
  }
  const hasSearch = Object.keys(search).length > 0
  if (!options.mark) {
    return { to: '/catalog', search: hasSearch ? search : undefined }
  }
  const markSlug = markSlugOf(options.mark, options.marks)
  if (!options.model) {
    return {
      to: '/catalog/$markSlug',
      params: { markSlug },
      search: hasSearch ? search : undefined,
    }
  }
  return {
    to: '/catalog/$markSlug/$modelSlug',
    params: { markSlug, modelSlug: modelSlugOf(options.model, options.models) },
    search: hasSearch ? search : undefined,
  }
}

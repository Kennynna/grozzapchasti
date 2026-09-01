export type Mark = {
  id: number
  name: string
  description: string | null
  images: string[]
  createdAt: string
  updatedAt: string
}

export type Model = {
  id: number
  name: string
  description: string | null
  images: string[]
  markId: number
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export type SparePart = {
  id: number
  name: string
  article: string | null
  description: string | null
  images: string[]
  price: number
  markId: number | null
  modelId: number | null
  categoryId: number
  createdAt: string
  updatedAt: string
}

export type Admin = {
  id: number
  login: string
}

export type LoginResponse = {
  accessToken: string
  admin: Admin
}

export type ModelsListFilters = {
  markId?: number
}

export type SparePartsListFilters = {
  markId?: number
  modelId?: number
  categoryId?: number
}

export type MarkWriteInput = {
  name?: string
  description?: string
  images?: File[]
}

export type ModelWriteInput = {
  name?: string
  description?: string
  markId?: number
  images?: File[]
}

export type CategoryWriteInput = {
  name?: string
  description?: string
}

export type SparePartWriteInput = {
  name?: string
  article?: string | null
  description?: string
  price?: number
  markId?: number | null
  modelId?: number | null
  categoryId?: number
  images?: File[]
}

export function imageFilename(path: string): string {
  const filename = path.split('/').pop()
  if (!filename) {
    throw new Error('Некорректный путь изображения')
  }
  return filename
}

export function firstImageSrc(images: string[]): string | undefined {
  return images[0]
}

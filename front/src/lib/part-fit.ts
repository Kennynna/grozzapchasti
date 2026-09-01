export type PartFit = 'auto' | 'mark' | 'all'

export function partFitFromIds(
  markId: number | null | undefined,
  modelId: number | null | undefined,
): PartFit {
  if (!markId) {
    return 'all'
  }
  if (!modelId) {
    return 'mark'
  }
  return 'auto'
}

export function partFitIds(fit: PartFit, markId?: number, modelId?: number) {
  return {
    markId: fit === 'all' ? null : (markId ?? null),
    modelId: fit === 'auto' ? (modelId ?? null) : null,
  }
}

export function isPartFitValid(fit: PartFit, markId?: number, modelId?: number) {
  if (fit === 'all') {
    return true
  }
  if (fit === 'mark') {
    return Boolean(markId)
  }
  return Boolean(markId && modelId)
}

export function partFitLabel(
  part: { markId: number | null; modelId: number | null },
  markName?: string,
  modelName?: string,
) {
  if (!part.markId) {
    return 'Для всех авто'
  }
  if (!part.modelId) {
    return markName ? `${markName} · все модели` : 'Все модели марки'
  }
  if (markName && modelName) {
    return `${markName} · ${modelName}`
  }
  return markName
}

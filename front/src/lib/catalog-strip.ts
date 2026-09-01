export const STRIP_PREVIEW_LIMIT = 10

export function previewStrip<T extends { id: number }>(
  items: T[],
  selectedId?: number,
): { items: T[]; hasMore: boolean } {
  if (items.length <= STRIP_PREVIEW_LIMIT) {
    return { items, hasMore: false }
  }

  const preview = items.slice(0, STRIP_PREVIEW_LIMIT)
  if (selectedId != null && !preview.some((item) => item.id === selectedId)) {
    const selected = items.find((item) => item.id === selectedId)
    if (selected) {
      preview[STRIP_PREVIEW_LIMIT - 1] = selected
    }
  }

  return { items: preview, hasMore: true }
}

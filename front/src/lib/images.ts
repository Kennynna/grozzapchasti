/** Превью рядом с полным webp: `uuid.webp` → `uuid.thumb.webp`. Старые jpeg/png/gif без превью. */
export function imageThumbSrc(src?: string): string | undefined {
  if (!src) {
    return undefined
  }
  const lower = src.toLowerCase()
  if (!lower.endsWith('.webp') || lower.endsWith('.thumb.webp')) {
    return src
  }
  return `${src.slice(0, -5)}.thumb.webp`
}

export function optionalText(value: string) {
  const text = value.trim()
  return text.length > 0 ? text : undefined
}

export function isTextDirty(current: string, original: string | null | undefined) {
  return current.trim() !== (original ?? '').trim()
}

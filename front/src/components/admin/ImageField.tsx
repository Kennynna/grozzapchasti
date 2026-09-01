// jpeg/png/webp/gif, ≤ 10 МБ, ≤ 3. См. FRONT.md и BACKEND.md
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const IMAGE_MAX_COUNT = 3
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

type ImageFieldProps = {
  files: File[]
  onChange: (files: File[]) => void
  existing?: string[]
  onRemoveExisting?: (path: string) => void
  removingExisting?: string
  disabled?: boolean
}

export function ImageField({
  files,
  onChange,
  existing = [],
  onRemoveExisting,
  removingExisting,
  disabled,
}: ImageFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  const remaining = IMAGE_MAX_COUNT - existing.length - files.length
  const helper = useMemo(
    () => `До ${IMAGE_MAX_COUNT} фото, jpeg/png/webp/gif, до 10 МБ`,
    [],
  )

  function addFiles(list: FileList | File[]) {
    const next = [...files]
    let error: string | undefined
    for (const file of Array.from(list)) {
      if (existing.length + next.length >= IMAGE_MAX_COUNT) {
        error = 'Можно загрузить не больше 3 фотографий'
        break
      }
      if (!IMAGE_TYPES.has(file.type)) {
        error = 'Можно загружать только jpeg, png, webp или gif'
        continue
      }
      if (file.size > IMAGE_MAX_BYTES) {
        error = 'Изображение слишком большое. Максимум 10 МБ'
        continue
      }
      next.push(file)
    }
    if (error) {
      toast.error(error)
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {existing.map((src) => (
          <div key={src} className="relative size-20 overflow-hidden rounded-md bg-secondary">
            <img src={src} alt="" className="size-full object-cover" />
            {onRemoveExisting ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Удалить фото"
                className="absolute top-1 right-1 bg-background/80"
                disabled={disabled || removingExisting === src}
                onClick={() => onRemoveExisting(src)}
              >
                <X />
              </Button>
            ) : null}
          </div>
        ))}
        {previews.map((src, index) => (
          <div key={`${files[index]?.name}-${index}`} className="relative size-20 overflow-hidden rounded-md bg-secondary">
            <img src={src} alt="" className="size-full object-cover" />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Убрать фото"
              className="absolute top-1 right-1 bg-background/80"
              disabled={disabled}
              onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
      {remaining > 0 ? (
        <div>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              if (event.target.files?.length) {
                addFiles(event.target.files)
              }
              event.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Добавить фото
          </Button>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

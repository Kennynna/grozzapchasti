import { imageThumbSrc } from '@/lib/images'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type CardImageVariant = 'thumb' | 'full'

type CardImageProps = {
  src?: string
  alt?: string
  className?: string
  imageClassName?: string
  priority?: boolean
  variant?: CardImageVariant
  sizes?: string
}

const DEFAULT_SIZES: Record<CardImageVariant, string> = {
  thumb: '(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw',
  full: '(min-width: 768px) 560px, 100vw',
}

export function CardImage({
  src,
  alt = '',
  className,
  imageClassName,
  priority = false,
  variant = 'thumb',
  sizes,
}: CardImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const [fallbackFor, setFallbackFor] = useState<string>()
  const thumb = imageThumbSrc(src)
  const hasThumb = Boolean(src && thumb && thumb !== src)
  const useFull = variant === 'full' || fallbackFor === src
  const active = useFull ? src : thumb
  const showImage = Boolean(active) && failedSrc !== src
  const srcSet =
    hasThumb && fallbackFor !== src ? `${thumb} 800w, ${src} 1600w` : undefined

  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-secondary',
        className,
      )}
    >
      {showImage ? (
        <img
          src={active}
          srcSet={srcSet}
          sizes={sizes ?? DEFAULT_SIZES[variant]}
          alt={alt}
          width={variant === 'full' ? 800 : 400}
          height={variant === 'full' ? 600 : 300}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          key={`${src}-${useFull ? 'full' : 'thumb'}`}
          className={cn('absolute inset-0 size-full object-cover', imageClassName)}
          onError={() => {
            if (!src) {
              return
            }
            if (hasThumb && fallbackFor !== src) {
              setFallbackFor(src)
              return
            }
            setFailedSrc(src)
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,135,76,0.12),transparent_62%)]" />
      )}
    </div>
  )
}

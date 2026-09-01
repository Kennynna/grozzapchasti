import { cn } from '@/lib/utils'
import { useState } from 'react'

type CardImageProps = {
  src?: string
  alt?: string
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function CardImage({
  src,
  alt = '',
  className,
  imageClassName,
  priority = false,
}: CardImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-secondary',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          width={400}
          height={300}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          className={cn('absolute inset-0 size-full object-cover', imageClassName)}
          onError={() => {
            if (src) {
              setFailedSrc(src)
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,135,76,0.12),transparent_62%)]" />
      )}
    </div>
  )
}

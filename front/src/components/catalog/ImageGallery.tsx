import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CardImage } from './CardImage'

type ImageGalleryProps = {
  images: string[]
  alt: string
  className?: string
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [index, setIndex] = useState(0)
  const src = images[index]
  const count = images.length

  if (!src) {
    return <CardImage alt={alt} className={cn('rounded-lg', className)} priority />
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative overflow-hidden rounded-lg">
        <CardImage src={src} alt={alt} className="rounded-lg" priority />
        {count > 1 ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Предыдущее фото"
              className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => setIndex((current) => (current - 1 + count) % count)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Следующее фото"
              className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => setIndex((current) => (current + 1) % count)}
            >
              <ChevronRight />
            </Button>
          </>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="flex gap-2">
          {images.map((image, imageIndex) => (
            <button
              key={image}
              type="button"
              aria-label={`Фото ${imageIndex + 1}`}
              aria-current={imageIndex === index}
              className={cn(
                'relative size-16 overflow-hidden rounded-md border bg-secondary',
                imageIndex === index ? 'border-primary' : 'border-border',
              )}
              onClick={() => setIndex(imageIndex)}
            >
              <CardImage src={image} alt="" className="size-16 aspect-auto" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

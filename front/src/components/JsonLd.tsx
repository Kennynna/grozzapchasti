import { useEffect } from 'react'

/** Микроразметка schema.org. Данные свои, поэтому экранируем только `<`. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/** Для 404 и ошибок: у корневого notFound нет своего `head`. */
export function RobotsMeta({ content }: { content: string }) {
  useEffect(() => {
    const tag = document.createElement('meta')
    tag.setAttribute('name', 'robots')
    tag.setAttribute('content', content)
    document.head.appendChild(tag)
    return () => {
      tag.remove()
    }
  }, [content])
  return null
}

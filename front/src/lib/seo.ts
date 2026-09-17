// og-теги и микроразметка. Витрина — SPA без SSR: превью ссылок в мессенджерах берут
// теги из index.html, а per-page теги и JSON-LD видят только краулеры с JS (Google, Яндекс).
import { site } from '@/config/site'
import { whatsappChatHref } from '@/lib/order-message'
import { partHref } from '@/lib/slug'
import type { SparePart } from '@/queries'

export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString()
}

export const STORE_ID = `${site.url}/#store`
export const WEBSITE_ID = `${site.url}/#website`

const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const NOINDEX_ROBOTS = 'noindex, nofollow'

type PageMetaInput = {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'product'
  noindex?: boolean
  keywords?: string
  imageAlt?: string
}

export function pageMeta({
  title,
  description = site.description,
  path = '/',
  image = site.ogImage,
  type = 'website',
  noindex = false,
  keywords = site.keywords,
  imageAlt = `${site.name} — премиальные автозапчасти`,
}: PageMetaInput) {
  const imageUrl = absoluteUrl(image)
  const defaultImage = image === site.ogImage
  const meta: { title?: string; name?: string; property?: string; content?: string }[] = [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: site.name },
    { property: 'og:locale', content: 'ru_RU' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: absoluteUrl(path) },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt },
  ]

  if (defaultImage) {
    meta.push(
      { property: 'og:image:width', content: String(site.ogImageWidth) },
      { property: 'og:image:height', content: String(site.ogImageHeight) },
    )
  }

  if (!noindex) {
    meta.push(
      { name: 'keywords', content: keywords },
      { name: 'geo.region', content: site.geo.region },
      { name: 'geo.placename', content: site.geo.placename },
      { name: 'geo.position', content: `${site.geo.latitude};${site.geo.longitude}` },
      { name: 'ICBM', content: `${site.geo.latitude}, ${site.geo.longitude}` },
    )
  }

  if (!noindex && site.yandexVerification) {
    meta.push({ name: 'yandex-verification', content: site.yandexVerification })
  }

  return meta
}

export function canonical(path: string) {
  const href = absoluteUrl(path)
  return [
    { rel: 'canonical', href },
    { rel: 'alternate', hreflang: 'ru', href },
  ]
}

/**
 * Статические og-теги из index.html нужны только краулерам без JS (WhatsApp, Telegram).
 * Снимаем после гидрации, когда TanStack уже поставил per-page title/canonical.
 */
export function dropStaticOgTags() {
  document.head.querySelectorAll('[data-og="static"]').forEach((tag) => tag.remove())
}

function phoneE164() {
  return `+${site.contacts.phone.replace(/\D/g, '')}`
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: site.contacts.streetAddress,
    addressLocality: site.contacts.addressLocality,
    addressRegion: site.contacts.addressRegion,
    postalCode: site.contacts.postalCode,
    addressCountry: site.contacts.addressCountry,
  }
}

export function yandexMapsUrl() {
  const { latitude, longitude } = site.geo
  return `https://yandex.ru/maps/?ll=${longitude},${latitude}&z=16&pt=${longitude},${latitude}`
}

export function storeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: site.name,
        url: site.url,
        description: site.description,
        inLanguage: 'ru-RU',
        publisher: { '@id': STORE_ID },
      },
      {
        '@type': 'AutoPartsStore',
        '@id': STORE_ID,
        name: site.name,
        description: site.description,
        url: site.url,
        image: absoluteUrl(site.ogImage),
        telephone: phoneE164(),
        email: site.contacts.email,
        address: postalAddress(),
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.geo.latitude,
          longitude: site.geo.longitude,
        },
        hasMap: yandexMapsUrl(),
        areaServed: [
          { '@type': 'City', name: site.contacts.addressLocality },
          { '@type': 'AdministrativeArea', name: site.contacts.addressRegion },
        ],
        priceRange: '₽₽',
        currenciesAccepted: 'RUB',
        paymentAccepted: 'Cash, Bank Transfer',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          opens: '09:00',
          closes: '18:00',
        },
        sameAs: [whatsappChatHref()],
      },
    ],
  }
}

export function faqJsonLd() {
  const entries = [
    ...site.orderSteps,
    site.sections.delivery,
    site.sections.warranty,
    site.sections.payment,
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.text,
      },
    })),
  }
}

export function catalogJsonLd(parts: SparePart[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Каталог автозапчастей ${site.name}`,
    numberOfItems: parts.length,
    itemListElement: parts.map((part, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(partHref(part)),
      name: part.name,
    })),
  }
}

type PartLabels = {
  markName?: string
  modelName?: string
  categoryName?: string
}

export function partSeoTitle(part: SparePart, labels: PartLabels = {}) {
  const fit = [labels.markName, labels.modelName].filter(Boolean).join(' ')
  const suffix = fit ? ` для ${fit}` : ''
  return `${part.name}${suffix} — купить в Грозном · ${site.name}`
}

export function partSeoDescription(part: SparePart, labels: PartLabels = {}) {
  if (part.description?.trim()) {
    return part.description.trim()
  }
  const fit = [labels.markName, labels.modelName].filter(Boolean).join(' ')
  const forCar = fit ? ` для ${fit}` : ''
  const article = part.article ? ` Артикул ${part.article}.` : ''
  return `Купить ${part.name}${forCar} в Грозном.${article} Оригинальные и проверенные автозапчасти, заказ в WhatsApp.`
}

export function partSeoKeywords(part: SparePart, labels: PartLabels = {}) {
  return [
    part.name,
    part.article,
    labels.markName,
    labels.modelName,
    labels.categoryName,
    'автозапчасти Грозный',
    site.name,
  ]
    .filter(Boolean)
    .join(', ')
}

export function productJsonLd(part: SparePart, labels: PartLabels = {}) {
  const images = part.images.map((image) => absoluteUrl(image))
  const fitsFor = [labels.markName, labels.modelName].filter(Boolean).join(' ')

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: part.name,
    description: partSeoDescription(part, labels),
    sku: part.article ?? undefined,
    mpn: part.article ?? undefined,
    category: labels.categoryName,
    brand: {
      '@type': 'Brand',
      name: labels.markName ?? site.name,
    },
    image: images.length > 0 ? images : [absoluteUrl(site.ogImage)],
    itemCondition: 'https://schema.org/NewCondition',
    isAccessoryOrSparePartFor: fitsFor
      ? { '@type': 'Vehicle', name: fitsFor }
      : undefined,
    mainEntityOfPage: absoluteUrl(partHref(part)),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(partHref(part)),
      price: part.price,
      priceCurrency: 'RUB',
      itemCondition: 'https://schema.org/NewCondition',
      // Наличия в API нет: позиции считаем доступными. Появится поле на бэке — поправить здесь
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'AutoPartsStore', '@id': STORE_ID, name: site.name },
      areaServed: {
        '@type': 'City',
        name: site.contacts.addressLocality,
      },
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

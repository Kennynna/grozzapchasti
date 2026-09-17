import { createFileRoute } from '@tanstack/react-router'
import { Phone } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { site } from '@/config/site'
import { telHref } from '@/lib/format'
import { whatsappChatHref } from '@/lib/order-message'
import { canonical, pageMeta, storeJsonLd } from '@/lib/seo'

export const Route = createFileRoute('/contacts')({
  head: () => ({
    meta: pageMeta({
      title: `Контакты · ${site.name}`,
      description: `Адрес, телефон и часы работы: ${site.contacts.address}. ${site.sections.delivery.text}`,
      path: '/contacts',
      keywords: `контакты ${site.name}, автозапчасти ${site.contacts.addressLocality}, доставка, гарантия, ${site.contacts.address}`,
    }),
    links: canonical('/contacts'),
  }),
  component: ContactsPage,
})

function ContactsPage() {
  const { phone, email, address, hours } = site.contacts
  const sections = [
    site.sections.delivery,
    site.sections.warranty,
    site.sections.payment,
    site.sections.about,
  ]
  return (
    <div className="relative overflow-x-clip">
      <div className="relative mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">Контакты</h1>
      <p className="mt-2 text-muted-foreground">Как с нами связаться и где забрать заказ.</p>
      <dl className="mt-10 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Телефон</dt>
          <dd className="mt-1">
            <a
              className="text-primary hover:text-primary-hover inline-flex items-center gap-2"
              href={telHref(phone)}
            >
              <Phone className="size-4" aria-hidden />+{phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Почта</dt>
          <dd className="mt-1">
            <a className="text-primary hover:text-primary-hover" href={`mailto:${email}`}>
              {email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Адрес</dt>
          <dd className="mt-1">{address}</dd>
        </div>
        <div className="sm:col-span-2 mt-2">
          <div className="mt-4 rounded-md overflow-hidden border">
            <iframe
              title="Яндекс.Карта — адрес"
              src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address as string)}`}
              width="100%"
              height={360}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Нажмите <a className="text-primary underline" href={`https://yandex.ru/maps/?text=${encodeURIComponent(address as string)}`} target="_blank" rel="noreferrer">Открыть в Яндекс.Картах</a> для детальной карты.
          </p>
        </div>
        <div>
          <dt className="text-muted-foreground">Часы</dt>
          <dd className="mt-1">{hours}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">WhatsApp</dt>
          <dd className="mt-1">
            <a
              className="text-primary hover:text-primary-hover inline-flex items-center gap-2"
              href={whatsappChatHref()}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="size-[18px]" />+{phone}
            </a>
            {' '}•{' '}
            <a className="text-primary hover:text-primary-hover" href={telHref(phone)}>
              Позвонить
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-16 space-y-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl">{section.title}</h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {section.text}
            </p>
          </section>
        ))}
      </div>
      <JsonLd data={storeJsonLd()} />
      </div>
    </div>
  )
}

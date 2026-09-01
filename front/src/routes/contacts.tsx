import { createFileRoute } from '@tanstack/react-router'
import { site } from '@/config/site'

export const Route = createFileRoute('/contacts')({
  head: () => ({
    meta: [
      { title: `Контакты · ${site.name}` },
      { name: 'description', content: site.description },
    ],
  }),
  component: ContactsPage,
})

function ContactsPage() {
  const { phone, email, address, hours } = site.contacts
  const sections = [site.sections.delivery, site.sections.warranty, site.sections.about]
  const telegramHref = `https://t.me/${site.telegram}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl">Контакты</h1>
      <p className="mt-2 text-muted-foreground">Как с нами связаться и где забрать заказ.</p>
      <dl className="mt-10 grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Телефон</dt>
          <dd className="mt-1">
            <a className="text-primary hover:text-primary-hover" href={`tel:${phone.replace(/\s/g, '')}`}>
              {phone}
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
        <div>
          <dt className="text-muted-foreground">Часы</dt>
          <dd className="mt-1">{hours}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Telegram</dt>
          <dd className="mt-1">
            <a
              className="text-primary hover:text-primary-hover"
              href={telegramHref}
              target="_blank"
              rel="noreferrer"
            >
              @{site.telegram}
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
    </div>
  )
}

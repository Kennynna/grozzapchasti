import { Link } from '@tanstack/react-router'
import { FooterParts } from '@/components/layout/ScatteredParts'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { site } from '@/config/site'
import { telHref } from '@/lib/format'
import { whatsappChatHref } from '@/lib/order-message'

const year = new Date().getFullYear()

export function Footer() {
  const { phone, address, hours } = site.contacts

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-border bg-secondary">
      <FooterParts />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-heading text-base font-semibold">{site.name}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Премиальные автозапчасти. Качество видно до цены.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm">
          {site.footerNav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              hash={item.hash}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <address className="space-y-1 text-sm not-italic text-muted-foreground">
          <p>
            <a className="hover:text-foreground" href={telHref(phone)}>
              +{phone}
            </a>
          </p>
          <p>
            <a
              className="hover:text-foreground inline-flex items-center gap-2"
              href={whatsappChatHref()}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="size-[18px]" />
              WhatsApp
            </a>
          </p>
          <p>{address}</p>
          <p>{hours}</p>
        </address>
      </div>
      <div className="relative border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {year} {site.name}. Все права защищены.
        </p>
      </div>
    </footer>
  )
}

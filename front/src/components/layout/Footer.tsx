import { Link } from '@tanstack/react-router'
import { site } from '@/config/site'

const year = new Date().getFullYear()

export function Footer() {
  const { phone, address, hours } = site.contacts

  return (
    <footer className="mt-auto border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
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
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <a className="hover:text-foreground" href={`tel:${phone.replace(/\s/g, '')}`}>
              {phone}
            </a>
          </p>
          <p>
            <a
              className="hover:text-foreground"
              href={`https://t.me/${site.telegram}`}
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
          </p>
          <p>{address}</p>
          <p>{hours}</p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {year} {site.name}. Все права защищены.
        </p>
      </div>
    </footer>
  )
}

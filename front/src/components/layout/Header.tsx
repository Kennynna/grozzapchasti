import { Link, useRouterState } from '@tanstack/react-router'
import { Heart, Menu, Phone, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { site } from '@/config/site'
import { telHref } from '@/lib/format'
import { whatsappChatHref } from '@/lib/order-message'
import { cn } from '@/lib/utils'
import { logout, useIsAdmin } from '@/queries'
import { selectCartCount, useCartStore, useFavoritesStore } from '@/stores'
import { FavoritesSheet } from './FavoritesSheet'
import { MobileNav } from './MobileNav'

function HeaderCount({ count }: { count: number }) {
  if (count < 1) {
    return null
  }

  return (
    <span
      aria-hidden
      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function countLabel(label: string, count: number) {
  if (count < 1) {
    return label
  }
  return `${label}, ${count}`
}

function isNavCurrent(pathname: string, to: string) {
  if (to === '/') {
    return pathname === '/'
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function Header() {
  const isAdmin = useIsAdmin()
  const cartCount = useCartStore(selectCartCount)
  const favoritesCount = useFavoritesStore((state) => state.ids.length)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Открыть меню"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen(true)}
        >
          <Menu aria-hidden />
        </Button>

        <Link to="/" className="hidden shrink-0 items-center md:flex">
          <img
            src={site.logo.src}
            alt={site.name}
            width={site.logo.width}
            height={site.logo.height}
            decoding="async"
            fetchPriority="high"
            className="h-12 w-auto object-contain md:h-14"
          />
        </Link>

        <nav aria-label="Основное меню" className="ml-3 hidden items-center gap-6 md:flex">
          {site.nav.map((item) => {
            const current = isNavCurrent(pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 font-heading text-[11px] font-medium tracking-[0.28em] uppercase transition-colors',
                  current
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary',
                )}
              >
                {current ? (
                  <span className="size-1.5 shrink-0 bg-primary" aria-hidden />
                ) : null}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <a
            href={telHref(site.contacts.phone)}
            className="mr-1 hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <Phone className="size-4 text-highlight" aria-hidden />
            +{site.contacts.phone}
          </a>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={whatsappChatHref()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в WhatsApp, откроется в новой вкладке"
              title="Написать в WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          </Button>

          {isAdmin ? (
            <div className="mr-2 hidden items-center gap-2 md:flex">
              <span className="text-xs tracking-wide text-highlight uppercase">Админ</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => logout()}>
                Выход
              </Button>
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={countLabel('Избранное', favoritesCount)}
            aria-expanded={favoritesOpen}
            aria-controls="favorites-sheet"
            className="relative"
            onClick={() => setFavoritesOpen(true)}
          >
            <Heart className="text-highlight" aria-hidden />
            <HeaderCount count={favoritesCount} />
          </Button>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link
              to="/cart"
              aria-label={countLabel('Корзина', cartCount)}
              aria-current={pathname.startsWith('/cart') ? 'page' : undefined}
            >
              <ShoppingBag className="text-highlight" aria-hidden />
              <HeaderCount count={cartCount} />
            </Link>
          </Button>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        pathname={pathname}
        isAdmin={isAdmin}
        onLogout={() => {
          logout()
          setMobileOpen(false)
        }}
      />

      <FavoritesSheet open={favoritesOpen} onOpenChange={setFavoritesOpen} />
    </header>
  )
}

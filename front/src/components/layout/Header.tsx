import { Link } from '@tanstack/react-router'
import { Heart, Menu, Phone, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { site } from '@/config/site'
import { telHref } from '@/lib/format'
import { whatsappChatHref } from '@/lib/order-message'
import { logout, useIsAdmin } from '@/queries'
import { selectCartCount, useCartStore, useFavoritesStore } from '@/stores'
import { FavoritesSheet } from './FavoritesSheet'
import { MobileNav } from './MobileNav'

function HeaderCount({ count }: { count: number }) {
  if (count < 1) {
    return null
  }

  return (
    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function Header() {
  const isAdmin = useIsAdmin()
  const cartCount = useCartStore(selectCartCount)
  const favoritesCount = useFavoritesStore((state) => state.ids.length)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Меню"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </Button>

        <Link to="/" className="flex shrink-0 items-center">
          <img
            src={site.logo.src}
            alt={site.name}
            width={site.logo.width}
            height={site.logo.height}
            decoding="async"
            fetchPriority="high"
            className="h-12 w-auto object-contain md:h-14"
          />
          <span className="sr-only">{site.name}</span>
        </Link>

        <nav className="ml-3 hidden items-center gap-6 text-sm md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              hash={'hash' in item ? item.hash : undefined}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
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
              aria-label="Написать в WhatsApp"
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
            aria-label="Избранное"
            className="relative"
            onClick={() => setFavoritesOpen(true)}
          >
            <Heart className="text-highlight" />
            <HeaderCount count={favoritesCount} />
          </Button>

          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart" aria-label="Корзина">
              <ShoppingBag className="text-highlight" />
              <HeaderCount count={cartCount} />
            </Link>
          </Button>
        </div>
      </div>

      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
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

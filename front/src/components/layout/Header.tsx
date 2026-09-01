import { Link } from '@tanstack/react-router'
import { Heart, Menu, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
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
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
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

        <Link to="/" className="shrink-0 font-heading text-lg font-semibold tracking-tight">
          {site.name}
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

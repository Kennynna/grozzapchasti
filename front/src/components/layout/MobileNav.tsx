import { Link } from '@tanstack/react-router'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { site } from '@/config/site'
import { telHref } from '@/lib/format'
import { whatsappChatHref } from '@/lib/order-message'
import { cn } from '@/lib/utils'

type MobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
  isAdmin: boolean
  onLogout: () => void
}

function isNavCurrent(pathname: string, to: string) {
  if (to === '/') {
    return pathname === '/'
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function MobileNav({
  open,
  onOpenChange,
  pathname = '',
  isAdmin,
  onLogout,
}: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72" id="mobile-nav">
        <SheetHeader>
          <SheetTitle className="sr-only">Меню</SheetTitle>
        </SheetHeader>
        <nav aria-label="Мобильное меню" className="flex flex-col gap-1 px-4">
          {site.nav.map((item) => {
            const current = isNavCurrent(pathname, item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-2 py-2.5 font-heading text-[11px] font-medium tracking-[0.28em] uppercase transition-colors',
                  current
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary',
                )}
                onClick={() => onOpenChange(false)}
              >
                {current ? (
                  <span className="size-1.5 shrink-0 bg-primary" aria-hidden />
                ) : (
                  <span className="size-1.5 shrink-0" aria-hidden />
                )}
                {item.label}
              </Link>
            )
          })}
          <Link
            to="/cart"
            aria-current={pathname.startsWith('/cart') ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-2 py-2.5 font-heading text-[11px] font-medium tracking-[0.28em] uppercase transition-colors',
              pathname.startsWith('/cart')
                ? 'bg-muted text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-primary',
            )}
            onClick={() => onOpenChange(false)}
          >
            {pathname.startsWith('/cart') ? (
              <span className="size-1.5 shrink-0 bg-primary" aria-hidden />
            ) : (
              <span className="size-1.5 shrink-0" aria-hidden />
            )}
            Корзина
          </Link>
          {isAdmin ? (
            <Button
              type="button"
              variant="ghost"
              className="mt-4 justify-start"
              onClick={onLogout}
            >
              Выход
            </Button>
          ) : null}
        </nav>

        <div className="mt-2 space-y-3 border-t border-border px-4 pt-6 text-sm">
          <a
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            href={telHref(site.contacts.phone)}
          >
            <Phone className="size-4 text-highlight" aria-hidden />
            +{site.contacts.phone}
          </a>
          <a
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            href={whatsappChatHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon />
            Написать в WhatsApp
            <span className="sr-only">, откроется в новой вкладке</span>
          </a>
          <p className="text-muted-foreground">{site.contacts.hours}</p>
        </div>

        <SheetFooter className="items-center">
          <Link
            to="/"
            className="inline-flex"
            onClick={() => onOpenChange(false)}
          >
            <img
              src={site.logo.src}
              alt={site.name}
              width={site.logo.width}
              height={site.logo.height}
              decoding="async"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

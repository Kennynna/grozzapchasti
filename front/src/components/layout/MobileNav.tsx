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

type MobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
  onLogout: () => void
}

export function MobileNav({ open, onOpenChange, isAdmin, onLogout }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="sr-only">{site.name}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {site.nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              hash={'hash' in item ? item.hash : undefined}
              className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/cart"
            className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
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

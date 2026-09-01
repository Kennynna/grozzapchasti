import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { site } from '@/config/site'

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
          <SheetTitle>{site.name}</SheetTitle>
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
      </SheetContent>
    </Sheet>
  )
}

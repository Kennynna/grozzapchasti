import { Link } from '@tanstack/react-router'
import { MapPin, ScanLine } from 'lucide-react'
import { HowToOrderParts } from '@/components/layout/ScatteredParts'
import { Button } from '@/components/ui/button'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { site } from '@/config/site'
import { whatsappChatHref } from '@/lib/order-message'

const stepIcons = [ScanLine, WhatsAppIcon, MapPin]

export function HowToOrder() {
  return (
    <section
      id="how-to-order"
      aria-labelledby="how-to-order-title"
      className="relative scroll-mt-16 overflow-hidden border-y border-border bg-secondary"
    >
      <HowToOrderParts />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.28em] text-primary uppercase">
          <span className="size-1.5 bg-primary" aria-hidden />
          Как заказать
        </p>
        <h2 id="how-to-order-title" className="mt-4 max-w-xl text-2xl md:text-3xl">
          Три шага до нужной детали
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3 md:gap-6">
          {site.orderSteps.map((step, index) => {
            const Icon = stepIcons[index]
            return (
              <li
                key={step.title}
                className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-muted text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="text-[11px] font-medium tracking-[0.28em] text-primary tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                </div>
                <h3 className="mt-5 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            )
          })}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <a href={whatsappChatHref()} target="_blank" rel="noopener noreferrer">
              Написать в WhatsApp
              <span className="sr-only">, откроется в новой вкладке</span>
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

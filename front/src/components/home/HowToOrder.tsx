import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import { whatsappChatHref } from '@/lib/order-message'

export function HowToOrder() {
  return (
    <section id="how-to-order" className="scroll-mt-16 border-y border-border bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.28em] text-primary uppercase">
          <span className="size-1.5 bg-primary" />
          Как заказать
        </p>
        <h2 className="mt-4 max-w-xl text-2xl md:text-3xl">Три шага до нужной детали</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {site.orderSteps.map((step, index) => (
            <li key={step.title} className="border-t border-border pt-5">
              <p className="text-xs font-medium tracking-[0.2em] text-primary tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 text-lg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <a href={whatsappChatHref()} target="_blank" rel="noopener noreferrer">
              Написать в WhatsApp
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#catalog">Перейти в каталог</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

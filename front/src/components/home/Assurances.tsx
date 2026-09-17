import { Link } from '@tanstack/react-router'
import { ArrowRight, ShieldCheck, Truck, Wallet } from 'lucide-react'
import { AssurancesParts } from '@/components/layout/ScatteredParts'
import { site } from '@/config/site'

const cards = [
  { section: site.sections.delivery, Icon: Truck },
  { section: site.sections.warranty, Icon: ShieldCheck },
  { section: site.sections.payment, Icon: Wallet },
]

export function Assurances() {
  return (
    <section className="relative overflow-x-clip">
      <AssurancesParts />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        <ul className="grid gap-4 sm:grid-cols-3 md:gap-6">
        {cards.map(({ section, Icon }) => (
          <li
            key={section.id}
            className="flex flex-col rounded-lg border border-border bg-card p-6"
          >
            <Icon className="size-5 text-primary" aria-hidden />
            <h3 className="mt-4 text-lg">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.text}</p>
            <Link
              to="/contacts"
              hash={section.id}
              className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm text-primary transition-colors hover:text-primary-hover"
            >
              Подробнее
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </li>
        ))}
        </ul>
      </div>
    </section>
  )
}

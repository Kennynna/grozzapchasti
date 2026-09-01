import { BadgeCheck, ScanLine, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

const highlightIcons = [BadgeCheck, ScanLine, ShieldCheck]
const CX = 240
const CY = 240

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,rgba(184,135,76,0.14),transparent_42%),radial-gradient(ellipse_at_12%_0%,rgba(229,195,161,0.05),transparent_36%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(184,135,76,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(184,135,76,0.12)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_70%_45%,black_18%,transparent_72%)]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-8 md:py-24 lg:py-28">
        <div className="flex flex-col gap-6">
          <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.28em] text-primary uppercase">
            <span className="size-1.5 bg-primary" />
            {site.heroEyebrow}
          </p>
          <h1 className="max-w-xl text-4xl leading-[1.12] md:text-5xl lg:text-6xl">
            {site.heroTitle}
          </h1>
          <p className="max-w-md text-base text-muted-foreground md:text-lg">
            {site.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <a href="#catalog">Перейти в каталог</a>
            </Button>
          </div>
        </div>

        <HeroRotor />
      </div>

      <ul className="relative mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {site.heroHighlights.map((item, index) => {
          const Icon = highlightIcons[index]
          return (
            <li key={item.title} className="flex items-start gap-3 px-4 py-5 md:px-5">
              <Icon className="mt-0.5 size-4 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function polar(radius: number, deg: number) {
  const angle = ((deg - 90) * Math.PI) / 180
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  }
}

function HeroRotor() {
  const face = 'hero-rotor-face'
  const rim = 'hero-rotor-rim'
  const glow = 'hero-rotor-glow'

  return (
    <div className="relative mx-auto aspect-square w-[min(100%,18rem)] md:w-full md:max-w-none" aria-hidden>
      <svg viewBox="0 0 480 480" className="relative h-full w-full">
        <defs>
          <radialGradient id={glow} cx="38%" cy="30%" r="62%">
            <stop offset="0%" stopColor="#C7A17A" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#B8874C" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0B0B0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={face} cx="36%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#3A3A40" />
            <stop offset="42%" stopColor="#1F1F23" />
            <stop offset="100%" stopColor="#121214" />
          </radialGradient>
          <linearGradient id={rim} x1="18%" y1="8%" x2="86%" y2="92%">
            <stop offset="0%" stopColor="#E5C3A1" />
            <stop offset="48%" stopColor="#B8874C" />
            <stop offset="100%" stopColor="#6E522E" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r="196" fill={`url(#${glow})`} />
        <circle
          cx="252"
          cy="226"
          r="188"
          fill="none"
          stroke="#E5C3A1"
          strokeOpacity="0.16"
          strokeDasharray="1.5 7"
        />

        {Array.from({ length: 72 }, (_, index) => {
          const major = index % 6 === 0
          const angle = index * 5
          const inner = polar(major ? 186 : 191, angle)
          const outer = polar(198, angle)
          return (
            <line
              key={index}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={major ? '#C7A17A' : '#A1A1A8'}
              strokeOpacity={major ? 0.55 : 0.22}
              strokeWidth={major ? 1.2 : 0.7}
            />
          )
        })}

        <g className="origin-[240px_240px] motion-safe:animate-[spin_80s_linear_infinite]">
          <circle cx={CX} cy={CY} r="172" fill={`url(#${face})`} />
          <circle cx={CX} cy={CY} r="172" fill="none" stroke={`url(#${rim})`} strokeWidth="2.4" />
          <circle cx={CX} cy={CY} r="166" fill="none" stroke="#E5C3A1" strokeOpacity="0.2" />

          {[160, 148, 136, 124, 112, 100, 88].map((radius) => (
            <circle
              key={radius}
              cx={CX}
              cy={CY}
              r={radius}
              fill="none"
              stroke="#F5F5F5"
              strokeOpacity="0.05"
            />
          ))}

          {Array.from({ length: 28 }, (_, index) => {
            const angle = (index * 360) / 28
            return (
              <rect
                key={index}
                x={CX - 3.2}
                y="94"
                width="6.4"
                height="52"
                rx="2.4"
                fill="#0B0B0B"
                fillOpacity="0.72"
                stroke="#B8874C"
                strokeOpacity="0.18"
                transform={`rotate(${angle} ${CX} ${CY})`}
              />
            )
          })}

          <circle cx={CX} cy={CY} r="78" fill="#121214" />
          <circle cx={CX} cy={CY} r="78" fill="none" stroke="#B8874C" strokeOpacity="0.35" />
          <circle cx={CX} cy={CY} r="70" fill="none" stroke="#2A2A2E" />
          <circle cx={CX} cy={CY} r="54" fill="none" stroke="#C7A17A" strokeOpacity="0.45" />

          {Array.from({ length: 5 }, (_, index) => {
            const point = polar(46, index * 72)
            return (
              <g key={index}>
                <circle cx={point.x} cy={point.y} r="11" fill="#0B0B0B" stroke="#C7A17A" />
                <circle cx={point.x} cy={point.y} r="5.2" fill="#1A1A1D" stroke="#E5C3A1" strokeOpacity="0.7" />
              </g>
            )
          })}

          <circle cx={CX} cy={CY} r="22" fill="#0B0B0B" />
          <circle cx={CX} cy={CY} r="22" fill="none" stroke={`url(#${rim})`} strokeWidth="1.6" />
          <circle cx={CX} cy={CY} r="8" fill="none" stroke="#E5C3A1" strokeOpacity="0.5" />
        </g>

        <line x1="42" y1={CY} x2="68" y2={CY} stroke="#B8874C" strokeOpacity="0.45" />
        <line x1="412" y1={CY} x2="438" y2={CY} stroke="#B8874C" strokeOpacity="0.45" />
        <line x1={CX} y1="42" x2={CX} y2="68" stroke="#B8874C" strokeOpacity="0.35" />
        <line x1={CX} y1="412" x2={CX} y2="438" stroke="#B8874C" strokeOpacity="0.35" />
      </svg>
    </div>
  )
}

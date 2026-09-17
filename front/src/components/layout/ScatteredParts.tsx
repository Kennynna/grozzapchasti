import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PartProps = {
  className?: string
}

function PartSvg({
  viewBox,
  className,
  children,
}: {
  viewBox: string
  className?: string
  children: ReactNode
}) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      aria-hidden
      focusable="false"
      className={cn('text-primary', className)}
    >
      {children}
    </svg>
  )
}

function gearPath(teeth: number, outer: number, inner: number, cx: number, cy: number) {
  const slice = (Math.PI * 2) / teeth
  const point = (angle: number, radius: number) =>
    `${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`
  const parts: string[] = []
  for (let index = 0; index < teeth; index += 1) {
    const a = index * slice - Math.PI / 2
    const command = index === 0 ? 'M' : 'L'
    parts.push(
      `${command}${point(a, inner)}`,
      `L${point(a + slice * 0.18, inner)}`,
      `L${point(a + slice * 0.3, outer)}`,
      `L${point(a + slice * 0.7, outer)}`,
      `L${point(a + slice * 0.82, inner)}`,
    )
  }
  return `${parts.join(' ')} Z`
}

export function SparkPlugPart({ className }: PartProps) {
  return (
    <PartSvg viewBox="0 0 80 240" className={className}>
      <rect x="33" y="8" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
      <line x1="36" x2="44" y1="14" y2="14" stroke="currentColor" strokeWidth="1.4" />
      <line x1="36" x2="44" y1="20" y2="20" stroke="currentColor" strokeWidth="1.4" />
      <rect x="36" y="26" width="8" height="12" stroke="currentColor" strokeWidth="1.8" />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <rect
          key={index}
          x="21"
          y={42 + index * 12}
          width="38"
          height="9"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="currentColor"
          fillOpacity="0.06"
        />
      ))}
      <path d="M20 118h40l-7 20H27z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
      <rect x="26" y="138" width="28" height="62" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
      {Array.from({ length: 10 }, (_, index) => (
        <line
          key={index}
          x1="28"
          x2="52"
          y1={146 + index * 5}
          y2={146 + index * 5}
          stroke="currentColor"
          strokeOpacity="0.55"
        />
      ))}
      <rect x="36" y="200" width="8" height="18" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M36 218h8v10c-1 8-16 9-18 1"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </PartSvg>
  )
}

export function PistonPart({ className }: PartProps) {
  return (
    <PartSvg viewBox="0 0 140 240" className={className}>
      <path
        d="M26 20h88c7 0 12 5 12 12v72H14V32c0-7 5-12 12-12z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.07"
      />
      <ellipse cx="70" cy="40" rx="30" ry="9" stroke="currentColor" strokeWidth="1.6" />
      {[0, 1, 2].map((index) => (
        <rect key={index} x="16" y={56 + index * 13} width="108" height="5" stroke="currentColor" strokeWidth="1.5" />
      ))}
      <path
        d="M28 104h84v38c0 10-12 20-26 20H54c-14 0-26-10-26-20z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <circle cx="70" cy="126" r="15" stroke="currentColor" strokeWidth="2" />
      <circle cx="70" cy="126" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M56 144h28l12 70H44z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.07" />
      <rect x="34" y="210" width="72" height="20" rx="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="70" cy="220" r="5" stroke="currentColor" strokeWidth="1.6" />
    </PartSvg>
  )
}

export function GearPart({ className }: PartProps) {
  const cx = 100
  const cy = 100
  return (
    <PartSvg viewBox="0 0 200 200" className={className}>
      <path
        d={gearPath(12, 92, 70, cx, cy)}
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.07"
      />
      <circle cx={cx} cy={cy} r="58" stroke="currentColor" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r="22" stroke="currentColor" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="8" stroke="currentColor" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((index) => {
        const angle = ((index * 90 - 90) * Math.PI) / 180
        return (
          <circle
            key={index}
            cx={cx + Math.cos(angle) * 40}
            cy={cy + Math.sin(angle) * 40}
            r="7"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        )
      })}
    </PartSvg>
  )
}

export function ShockPart({ className }: PartProps) {
  return (
    <PartSvg viewBox="0 0 90 260" className={className}>
      <rect x="40" y="6" width="10" height="20" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="45" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="26" y="26" width="38" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      {Array.from({ length: 7 }, (_, index) => (
        <ellipse
          key={index}
          cx="45"
          cy={50 + index * 14}
          rx={index % 2 === 0 ? 28 : 22}
          ry="8"
          stroke="currentColor"
          strokeWidth="2.2"
        />
      ))}
      <rect
        x="32"
        y="146"
        width="26"
        height="78"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.07"
      />
      <line x1="38" x2="52" y1="158" y2="158" stroke="currentColor" />
      <line x1="38" x2="52" y1="186" y2="186" stroke="currentColor" />
      <rect x="28" y="224" width="34" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="45" cy="246" r="11" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="45" cy="246" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </PartSvg>
  )
}

export function OilFilterPart({ className }: PartProps) {
  return (
    <PartSvg viewBox="0 0 110 160" className={className}>
      <rect x="38" y="8" width="34" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M46 12h18M46 18h18M46 24h18" stroke="currentColor" />
      <path
        d="M24 28h62c8 0 14 6 14 14v86c0 8-6 14-14 14H24c-8 0-14-6-14-14V42c0-8 6-14 14-14z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.07"
      />
      {Array.from({ length: 8 }, (_, index) => (
        <line
          key={index}
          x1="16"
          x2="94"
          y1={50 + index * 10}
          y2={50 + index * 10}
          stroke="currentColor"
          strokeOpacity="0.45"
        />
      ))}
      <ellipse cx="55" cy="144" rx="30" ry="6" stroke="currentColor" strokeWidth="1.6" />
    </PartSvg>
  )
}

export function SpringPart({ className }: PartProps) {
  const coils = Array.from({ length: 7 }, (_, index) => {
    const y = 20 + index * 26
    return `M18 ${y} C18 ${y - 13} 62 ${y - 13} 62 ${y} C62 ${y + 13} 18 ${y + 13} 18 ${y + 26}`
  }).join(' ')
  return (
    <PartSvg viewBox="0 0 80 230" className={className}>
      <rect x="22" y="6" width="36" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d={coils} stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <rect x="22" y="214" width="36" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </PartSvg>
  )
}

const PHI = (1 + Math.sqrt(5)) / 2
const ICOSA_RAW: [number, number, number][] = [
  [0, 1, PHI],
  [0, -1, PHI],
  [0, 1, -PHI],
  [0, -1, -PHI],
  [1, PHI, 0],
  [-1, PHI, 0],
  [1, -PHI, 0],
  [-1, -PHI, 0],
  [PHI, 0, 1],
  [-PHI, 0, 1],
  [PHI, 0, -1],
  [-PHI, 0, -1],
]
const ICOSA_ROT_X = 0.72
const ICOSA_ROT_Y = 0.48
const ICOSA_POINTS = ICOSA_RAW.map(([x, y, z]) => {
  const y1 = y * Math.cos(ICOSA_ROT_X) - z * Math.sin(ICOSA_ROT_X)
  const z1 = y * Math.sin(ICOSA_ROT_X) + z * Math.cos(ICOSA_ROT_X)
  const x2 = x * Math.cos(ICOSA_ROT_Y) + z1 * Math.sin(ICOSA_ROT_Y)
  const z2 = -x * Math.sin(ICOSA_ROT_Y) + z1 * Math.cos(ICOSA_ROT_Y)
  return { x: 100 + x2 * 38, y: 100 - y1 * 38, z: z2 }
})
const ICOSA_EDGES: [number, number][] = []
for (let i = 0; i < ICOSA_RAW.length; i += 1) {
  for (let j = i + 1; j < ICOSA_RAW.length; j += 1) {
    const dx = ICOSA_RAW[i][0] - ICOSA_RAW[j][0]
    const dy = ICOSA_RAW[i][1] - ICOSA_RAW[j][1]
    const dz = ICOSA_RAW[i][2] - ICOSA_RAW[j][2]
    if (Math.abs(dx * dx + dy * dy + dz * dz - 4) < 0.2) {
      ICOSA_EDGES.push([i, j])
    }
  }
}
ICOSA_EDGES.sort((a, b) => {
  const za = ICOSA_POINTS[a[0]].z + ICOSA_POINTS[a[1]].z
  const zb = ICOSA_POINTS[b[0]].z + ICOSA_POINTS[b[1]].z
  return za - zb
})

export function PolyhedronPart({ className }: PartProps) {
  return (
    <PartSvg viewBox="0 0 200 200" className={className}>
      {ICOSA_EDGES.map(([from, to], index) => {
        const depth = (ICOSA_POINTS[from].z + ICOSA_POINTS[to].z) / 2
        const back = depth < 0
        return (
          <line
            key={`${from}-${to}`}
            x1={ICOSA_POINTS[from].x}
            y1={ICOSA_POINTS[from].y}
            x2={ICOSA_POINTS[to].x}
            y2={ICOSA_POINTS[to].y}
            stroke="currentColor"
            strokeWidth={back ? 1.1 : 1.8}
            strokeOpacity={back ? 0.28 : 0.9 - index * 0.012}
          />
        )
      })}
      {ICOSA_POINTS.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={point.z > 0 ? 2.2 : 1.4}
          fill="currentColor"
          fillOpacity={point.z > 0 ? 0.85 : 0.3}
        />
      ))}
    </PartSvg>
  )
}

function Layer({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
    >
      {children}
    </div>
  )
}

function BleedLayer({ children }: { children: ReactNode }) {
  return (
    <Layer className="top-0 left-1/2 h-full w-screen -translate-x-1/2">{children}</Layer>
  )
}

export function CatalogPolyhedron() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <PolyhedronPart className="absolute bottom-12 left-1/2 w-32 -translate-x-1/2 rotate-6 opacity-30 sm:bottom-16 sm:w-44 md:bottom-20 md:w-56 md:opacity-40 lg:w-64" />
    </div>
  )
}

/** Свеча и шестерня стоят от верха страницы, а не от высоты каталога. */
export function SiteWideParts() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-1 overflow-hidden select-none"
    >
      <SparkPlugPart className="absolute top-[calc(100svh+5rem)] -left-1.5 w-10 rotate-[-28deg] opacity-25 sm:left-1 sm:w-14 md:left-[max(0.25rem,calc((100vw-72rem)/2-2rem))] md:w-20 md:opacity-35 lg:w-24" />
      <GearPart className="absolute top-[calc(100svh+1rem)] -right-2.5 w-18 rotate-18 opacity-25 sm:right-1 sm:w-28 md:right-[max(0.25rem,calc((100vw-72rem)/2-2.5rem))] md:w-40 md:opacity-35 lg:w-48" />
    </div>
  )
}

export function HowToOrderParts() {
  return (
    <Layer>
      <ShockPart className="absolute top-4 -right-6 hidden w-24 rotate-12 opacity-35 sm:block sm:top-8 sm:right-[2%] sm:w-32 md:opacity-45" />
    </Layer>
  )
}

export function AssurancesParts() {
  return (
    <BleedLayer>
      <OilFilterPart className="absolute top-2 -left-5 hidden w-24 rotate-[-18deg] opacity-30 sm:block sm:left-[min(2%,calc((100vw-72rem)/2))] sm:w-28 md:opacity-40" />
    </BleedLayer>
  )
}

export function FooterParts() {
  return (
    <Layer>
      <SpringPart className="absolute -right-4 bottom-2 w-14 rotate-8 opacity-30 sm:w-16 md:right-0 md:translate-x-1/4 md:opacity-40" />
    </Layer>
  )
}

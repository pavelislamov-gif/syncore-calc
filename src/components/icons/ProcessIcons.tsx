import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface IconProps {
  className?: string
  title?: string
}

function Svg({ className, title, children }: { className?: string; title: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{title}</title>
      {children}
    </svg>
  )
}

/** Vertical milling machine: column, spindle, table, handwheel. */
export function MillingProcessIcon({ className, title = 'Фрезерование' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M10 42h28" />
      <path d="M12 42V18h8v24" />
      <path d="M16 18V8h16v7H24" />
      <path d="M24 15v9" />
      <path d="M22.2 24h3.6" />
      <path d="M11 28h26" />
      <path d="M14 28v3h20v-3" />
      <circle cx="34" cy="36.5" r="4" />
      <path d="M34 33.2v6.6M31.2 36.5h5.6" />
    </Svg>
  )
}

/** Lathe: bench, headstock, chuck, tailstock. */
export function TurningProcessIcon({ className, title = 'Токарная обработка' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M6 40h36" />
      <path d="M8 40V28h32v12" />
      <path d="M14 28v12M20 28v12M32 28v12" />
      <path d="M10 28V16h8v12" />
      <circle cx="18" cy="22" r="3.4" />
      <path d="M21.4 22h12.2" />
      <path d="M33.6 16.5h6v11h-6" />
      <path d="M33.6 22h-3" />
    </Svg>
  )
}

/** Laser cutter: gantry head, beam, sparks, sheet. */
export function LaserProcessIcon({ className, title = 'Лазерная резка' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M16 6h16v4H16z" />
      <path d="M18 10h12v4H18z" />
      <path d="M21 14h6v5h-6z" />
      <path d="M24 19v12" />
      <path d="M24 27l-3.2 4M24 27l3.2 4M21.2 29.5h5.6" />
      <path d="M10 36h28v6H10z" />
      <path d="M24 36v6" />
    </Svg>
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface IconProps {
  className?: string
  title?: string
}

function Svg({ className, title, children }: { className?: string; title: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{title}</title>
      {children}
    </svg>
  )
}

/** Top view of an end mill plus a slot in the work. */
export function MillingProcessIcon({ className, title = 'Фрезерование' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <circle cx="16" cy="13" r="7.2" />
      <circle cx="16" cy="13" r="1.6" fill="currentColor" stroke="none" />
      <path d="M16 5.8v14.4M8.8 13h14.4" />
      <path d="M11.2 7.4 20.8 18.6M20.8 7.4 11.2 18.6" strokeWidth="1.2" />
      <path d="M6 24h20" />
      <path d="M10 24v3.2h12V24" />
    </Svg>
  )
}

/** Bar in a chuck and a turning insert. */
export function TurningProcessIcon({ className, title = 'Токарная обработка' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <ellipse cx="7" cy="14" rx="3.2" ry="5" />
      <path d="M7 9h16.5c.8 0 1.5.7 1.5 1.5v7c0 .8-.7 1.5-1.5 1.5H7" />
      <path d="M23.5 10.2v9.6" />
      <path d="M15.5 20.5 19 26h6" />
      <path d="M15.5 20.5h3.2v3.2" />
      <path d="M4.8 7.2c1.4-1.6 3.3-2.4 5.2-2.4" />
    </Svg>
  )
}

/** Cutting head, beam and kerf in sheet. */
export function LaserProcessIcon({ className, title = 'Лазерная резка' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <path d="M11 4h10l-3.4 7H14.4L11 4Z" />
      <path d="M16 11v8" />
      <path d="M16 16.5 13.2 20M16 16.5l2.8 3.5" />
      <rect x="5" y="21" width="22" height="5.5" rx="0.8" />
      <path d="M16 21v5.5" />
    </Svg>
  )
}

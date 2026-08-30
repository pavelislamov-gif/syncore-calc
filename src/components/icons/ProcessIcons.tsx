import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface IconProps {
  className?: string
  title?: string
}

function Svg({ className, title, children }: { className?: string; title: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn('shrink-0', className)} role="img" aria-label={title}>
      <title>{title}</title>
      {children}
    </svg>
  )
}

/** End mill cutting a slot. */
export function MillingProcessIcon({ className, title = 'Фрезерование' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <rect x="3.5" y="16.2" width="17" height="4.4" rx="0.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16.2V14.4h8v1.8" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.15" y="3.2" width="3.7" height="12.2" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.4 7.2c.9 1.1 2.3 1.1 3.2 0M10.4 10.4c.9 1.1 2.3 1.1 3.2 0M10.4 13.5c.9 1.1 2.3 1.1 3.2 0"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M16.2 5.2a2.6 2.6 0 0 0 2.2-2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M17.8 3.4l1.1-.9M17.8 3.4l.2 1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  )
}

/** Lathe: rotating bar and turning tool. */
export function TurningProcessIcon({ className, title = 'Токарная обработка' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <ellipse cx="5.2" cy="11" rx="2.1" ry="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.4 7.6h12.4a.8.8 0 0 1 .8.8v5.2a.8.8 0 0 1-.8.8H5.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18.6 8.2v6.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.2 6.2A4 4 0 0 1 6.4 4.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5.6 5l1.3-.3M5.6 5l-.4-1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M13.2 15.4 16 18.4h3.4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13.2 15.4h2.4v2.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  )
}

/** Laser head, beam and sheet kerf. */
export function LaserProcessIcon({ className, title = 'Лазерная резка' }: IconProps) {
  return (
    <Svg className={className} title={title}>
      <rect x="3.5" y="15.4" width="17" height="4.6" rx="0.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 15.4v4.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.6 4.2h6.8l-2.1 5.4H10.7L8.6 4.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9.6v5.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12.2 9.6 14.6M12 12.2l2.4 2.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  )
}

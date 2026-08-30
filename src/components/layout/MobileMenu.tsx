import { NavLink, useLocation } from 'react-router-dom'
import { moreLinks, primaryNav, isTurningSection } from '@/components/layout/nav'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: Props) {
  const { pathname } = useLocation()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Меню">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Закрыть меню" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[min(88dvh,40rem)] overflow-y-auto rounded-t-3xl bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_40px_rgba(18,21,26,0.18)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Разделы</p>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Калькуляторы</p>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold ring-1 ring-line',
                    isActive || (item.to === '/turning' && isTurningSection(pathname))
                      ? 'bg-graphite text-white ring-graphite'
                      : 'bg-paper-2 text-ink',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-muted">Ещё</p>
        <ul className="mt-2 space-y-1">
          {moreLinks.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold',
                    isActive ? 'bg-graphite text-white' : 'text-ink-soft',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { Calculator, Menu, ScanLine, Scissors, Spline } from 'lucide-react'
import { cn } from '@/utils/cn'
import { isMoreRoute } from '@/components/layout/nav'

const items = [
  { to: '/milling', label: 'Фреза', icon: Calculator },
  { to: '/turning', label: 'Токарка', icon: Scissors },
  { to: '/laser', label: 'Лазер', icon: ScanLine },
  { to: '/threading', label: 'Резьба', icon: Spline },
] as const

interface Props {
  onOpenMore: () => void
}

export function BottomNav({ onOpenMore }: Props) {
  const { pathname } = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-medium text-muted',
                  isActive && 'text-ink',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={cn(
              'flex w-full flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-medium text-muted',
              isMoreRoute(pathname) && 'text-ink',
            )}
            onClick={onOpenMore}
          >
            <Menu className="h-5 w-5" />
            Ещё
          </button>
        </li>
      </ul>
    </nav>
  )
}

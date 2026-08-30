import { NavLink } from 'react-router-dom'
import { Calculator, History, House, ScanLine, Star } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/', label: 'Главная', icon: House, end: true },
  { to: '/milling', label: 'Фреза', icon: Calculator },
  { to: '/laser', label: 'Лазер', icon: ScanLine },
  { to: '/history', label: 'История', icon: History },
  { to: '/favorites', label: 'Избранное', icon: Star },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
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
      </ul>
    </nav>
  )
}

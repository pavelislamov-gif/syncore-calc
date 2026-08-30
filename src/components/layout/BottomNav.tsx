import { NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { cn } from '@/utils/cn'
import { isMoreRoute, isTurningSection } from '@/components/layout/nav'
import { LaserProcessIcon, MillingProcessIcon, TurningProcessIcon } from '@/components/icons/ProcessIcons'

const items = [
  { to: '/milling', label: 'Фреза', Icon: MillingProcessIcon, match: (path: string) => path.startsWith('/milling') },
  { to: '/turning', label: 'Токарка', Icon: TurningProcessIcon, match: isTurningSection },
  { to: '/laser', label: 'Лазер', Icon: LaserProcessIcon, match: (path: string) => path.startsWith('/laser') },
] as const

interface Props {
  onOpenMore: () => void
}

export function BottomNav({ onOpenMore }: Props) {
  const { pathname } = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={() =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl px-1 py-1 text-[11px] font-medium text-muted',
                  item.match(pathname) && 'text-ink',
                )
              }
            >
              <item.Icon className="h-7 w-7" />
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

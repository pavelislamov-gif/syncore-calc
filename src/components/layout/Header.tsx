import { Link, NavLink } from 'react-router-dom'
import { Gauge } from 'lucide-react'
import { cn } from '@/utils/cn'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/milling', label: 'Фрезерование' },
  { to: '/turning', label: 'Токарка' },
  { to: '/threading', label: 'Резьба' },
  { to: '/laser', label: 'Лазер' },
  { to: '/materials', label: 'Материалы' },
  { to: '/tools', label: 'Инструмент' },
  { to: '/history', label: 'История' },
  { to: '/favorites', label: 'Избранное' },
  { to: '/pro', label: 'PRO' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-graphite text-white">
            <Gauge className="h-5 w-5" />
          </span>
          TechCalc
        </Link>
        <nav className="hidden items-center gap-1 overflow-x-auto lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:text-ink',
                  isActive && 'bg-white text-ink shadow-sm',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

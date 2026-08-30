import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { cn } from '@/utils/cn'
import { headerLinks, isTurningSection } from '@/components/layout/nav'
import { BrandWordmark } from '@/components/layout/BrandLogo'

interface Props {
  onOpenMenu: () => void
}

export function Header({ onOpenMenu }: Props) {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-30 h-[var(--app-header-height)] overflow-visible border-b border-white/10 bg-black">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="min-w-0 overflow-visible" aria-label="SYNCORE calc">
          <BrandWordmark />
        </Link>
        <nav className="hidden items-center gap-1 overflow-x-auto lg:flex">
          {headerLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-2.5 py-2 text-sm font-medium text-white/55 transition-colors hover:text-white',
                  (isActive || (link.to === '/turning' && isTurningSection(pathname))) && 'bg-white/10 text-white',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white lg:hidden"
          aria-label="Открыть меню"
          onClick={onOpenMenu}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  )
}

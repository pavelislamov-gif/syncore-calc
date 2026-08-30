import { NavLink, Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-paper pb-20 md:pb-0">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
      <footer className="mx-auto hidden max-w-6xl px-6 py-8 text-sm text-muted md:block">
        TechCalc · справочные режимы резания. Фактический режим зависит от станка, инструмента и заготовки.{' '}
        <NavLink to="/pro" className="text-ink underline-offset-2 hover:underline">
          PRO
        </NavLink>
      </footer>
      <BottomNav />
    </div>
  )
}

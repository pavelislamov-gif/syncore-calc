import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { trackPageView } from '@/services/telemetry/client'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    trackPageView(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <div className="min-h-dvh bg-paper pb-20 lg:pb-0">
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
      <SiteFooter />
      <BottomNav onOpenMore={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}

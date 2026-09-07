import { Navigate, Route, Routes } from 'react-router-dom'
import { PageMeta } from '@/components/seo/PageMeta'
import { routePathVariants } from '@/data/seo'
import { AppLayout } from '@/layouts/AppLayout'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HomePage } from '@/pages/HomePage'
import { LaserPage } from '@/pages/LaserPage'
import { MaterialsPage } from '@/pages/MaterialsPage'
import { MillingPage } from '@/pages/MillingPage'
import { ProPage } from '@/pages/ProPage'
import { ThreadingPage } from '@/pages/ThreadingPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { TurningPage } from '@/pages/TurningPage'
import { UsagePage } from '@/pages/UsagePage'
import type { ReactNode } from 'react'

function spaRoutes(path: string, element: ReactNode) {
  return routePathVariants(path).map((variant) => <Route key={variant} path={variant} element={element} />)
}

export default function App() {
  return (
    <>
      <PageMeta />
      <Routes>
        <Route element={<AppLayout />}>
          {spaRoutes('/', <HomePage />)}
          {spaRoutes('/milling', <MillingPage />)}
          {spaRoutes('/turning', <TurningPage />)}
          {spaRoutes('/threading', <ThreadingPage />)}
          {spaRoutes('/laser', <LaserPage />)}
          {spaRoutes('/materials', <MaterialsPage />)}
          {spaRoutes('/tools', <ToolsPage />)}
          {spaRoutes('/history', <HistoryPage />)}
          {spaRoutes('/favorites', <FavoritesPage />)}
          {spaRoutes('/pro', <ProPage />)}
          {spaRoutes('/usage', <UsagePage />)}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

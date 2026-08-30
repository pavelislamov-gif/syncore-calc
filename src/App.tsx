import { Navigate, Route, Routes } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/milling" element={<MillingPage />} />
        <Route path="/turning" element={<TurningPage />} />
        <Route path="/threading" element={<ThreadingPage />} />
        <Route path="/laser" element={<LaserPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/pro" element={<ProPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

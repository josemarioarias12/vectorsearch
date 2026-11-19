import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import './index.css'

const Landing = lazy(() => import('./pages/Landing'))
const AppPage = lazy(() => import('./pages/AppPage'))

createRoot(document.getElementById('root') as HTMLElement).render(
  <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <Suspense fallback={<p className="p-8 text-mut">Cargando…</p>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </MotionConfig>,
)

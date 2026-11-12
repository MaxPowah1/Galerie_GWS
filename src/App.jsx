import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import './App.css'
import { SplashProvider } from './context/SplashContext'
import Layout from './components/Layout'
import Home from './pages/Home'

const Catalogue = lazy(() => import('./pages/Catalogue'))
const Work = lazy(() => import('./pages/Work'))

export default function App() {
  return (
    <BrowserRouter>
      <SplashProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="katalog" element={<Catalogue />} />
              <Route path="werk/:slug" element={<Work />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </SplashProvider>
    </BrowserRouter>
  )
}

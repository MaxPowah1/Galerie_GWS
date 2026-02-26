import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { SplashProvider } from './context/SplashContext'
import Layout from './components/Layout'
import Home from './pages/Home'

const Catalogue = lazy(() => import('./pages/Catalogue'))

export default function App() {
  return (
    <BrowserRouter>
      <SplashProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="katalog" element={<Catalogue />} />
            </Route>
          </Routes>
        </Suspense>
      </SplashProvider>
    </BrowserRouter>
  )
}

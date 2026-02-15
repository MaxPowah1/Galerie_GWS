import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { SplashProvider } from './context/SplashContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'

export default function App() {
  return (
    <HashRouter>
      <SplashProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="katalog" element={<Catalogue />} />
          </Route>
        </Routes>
      </SplashProvider>
    </HashRouter>
  )
}

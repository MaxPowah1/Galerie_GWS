import { createContext, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SplashContext = createContext({ splashVisible: false, setSplashDone: () => {} })

export function SplashProvider({ children }) {
  const { pathname } = useLocation()
  const [splashDone, setSplashDone] = useState(false)
  const isHome = pathname === '' || pathname === '/'
  const splashVisible = isHome && !splashDone
  return (
    <SplashContext.Provider value={{ splashVisible, setSplashDone }}>
      {children}
    </SplashContext.Provider>
  )
}

export function useSplash() {
  return useContext(SplashContext)
}

import { createContext, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SPLASH_SESSION_KEY = 'gws_home_splash_seen'

const SplashContext = createContext({ splashVisible: false, setSplashDone: () => {} })

export function SplashProvider({ children }) {
  const { pathname } = useLocation()
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(SPLASH_SESSION_KEY) === '1'
  })

  const markSplashDone = (done) => {
    setSplashDone(done)
    if (typeof window === 'undefined') return
    if (done) {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1')
    } else {
      window.sessionStorage.removeItem(SPLASH_SESSION_KEY)
    }
  }

  const isHome = pathname === '' || pathname === '/'
  const splashVisible = isHome && !splashDone
  return (
    <SplashContext.Provider value={{ splashVisible, setSplashDone: markSplashDone }}>
      {children}
    </SplashContext.Provider>
  )
}

export function useSplash() {
  return useContext(SplashContext)
}

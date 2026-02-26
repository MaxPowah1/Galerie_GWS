import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSplash } from '../context/SplashContext'

const NAV_ITEMS = [
  { href: '/#portfolio-lab', label: 'Impressionen', isHash: true },
  { href: '/katalog', label: 'Katalog', isHash: false },
  { href: '/#artist', label: 'Künstlerin', isHash: true },
  { href: '/#contact', label: 'Kontakt', isHash: true },
]

function getSectionId(href) {
  if (!href.includes('#')) return ''
  return href.split('#')[1] || ''
}

function scrollToSection(sectionId, behavior = 'smooth') {
  const el = document.getElementById(sectionId)
  if (el) el.scrollIntoView({ behavior, block: 'start' })
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { splashVisible } = useSplash()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 681px)')
    const handleResize = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', handleResize)
    return () => mq.removeEventListener('change', handleResize)
  }, [])

  useEffect(() => {
    const sectionId = location.state?.scrollTo
    if (location.pathname !== '/' || !sectionId) return
    const rafId = window.requestAnimationFrame(() => scrollToSection(sectionId))
    navigate(location.pathname, { replace: true, state: null })
    return () => window.cancelAnimationFrame(rafId)
  }, [location.pathname, location.state, navigate])

  const handleNavClick = (e, href, isHash) => {
    closeMenu()
    if (!isHash) return
    e.preventDefault()
    const sectionId = getSectionId(href)
    if (!sectionId) return
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } })
      return
    }
    scrollToSection(sectionId)
  }

  return (
    <div className="site-shell">
      {!splashVisible && (
      <header className="topbar">
        <button
          type="button"
          className="topbar__menu-btn"
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={menuOpen}
          aria-controls="topbar-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="topbar__menu-btn-inner" aria-hidden>
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 5h16M2 10h16M2 15h16" />
              </svg>
            )}
          </span>
        </button>
        <nav
          id="topbar-nav"
          className={`topbar__nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Hauptnavigation"
        >
          {NAV_ITEMS.map(({ href, label, isHash }) =>
            isHash ? (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href, true)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                to={href}
                className={location.pathname === href ? 'is-active' : ''}
                onClick={closeMenu}
              >
                {label}
              </Link>
            )
          )}
        </nav>
        <Link to="/" className="topbar__name">
          Gabriele Wenger-Scherb
        </Link>
      </header>
      )}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

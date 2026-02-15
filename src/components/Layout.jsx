import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { href: '/#portfolio-lab', label: 'Werke', isHash: true },
  { href: '/katalog', label: 'Katalog', isHash: false },
  { href: '/#artist', label: 'Künstlerin', isHash: true },
  { href: '/#contact', label: 'Kontakt', isHash: true },
]

function scrollToAnchor(e, href) {
  if (!href.includes('#')) return
  e.preventDefault()
  const hash = href.split('#')[1]
  if (!hash) return
  if (window.location.pathname !== '/') {
    window.location.href = href
    return
  }
  window.location.hash = hash
  const el = document.getElementById(hash)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Layout() {
  const location = useLocation()
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

  const handleNavClick = (e, href, isHash) => {
    closeMenu()
    if (isHash) scrollToAnchor(e, href)
  }

  return (
    <div className="site-shell">
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
      <main>
        <Outlet />
      </main>
    </div>
  )
}

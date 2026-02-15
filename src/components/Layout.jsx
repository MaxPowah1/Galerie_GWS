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

  return (
    <div className="site-shell">
      <header className="topbar">
        <nav className="topbar__nav" aria-label="Hauptnavigation">
          {NAV_ITEMS.map(({ href, label, isHash }) =>
            isHash ? (
              <a
                key={href}
                href={href}
                onClick={(e) => scrollToAnchor(e, href)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                to={href}
                className={location.pathname === href ? 'is-active' : ''}
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

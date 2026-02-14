import { Link, Outlet } from 'react-router-dom'

const SLIDE_ANCHORS = [
  { href: '/#portfolio', label: 'Werke' },
  { href: '/katalog', label: 'Katalog' },
  { href: '/#artist', label: 'Kuenstlerin' },
  { href: '/#contact', label: 'Kontakt' },
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
}

export default function Layout() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <a href="/#hero" className="topbar__name" onClick={(e) => scrollToAnchor(e, '/#hero')}>
          Gabriele Wenger-Scherb
        </a>
        <nav className="topbar__nav" aria-label="Hauptnavigation">
          {SLIDE_ANCHORS.map(({ href, label }) => (
            href.includes('#') ? (
              <a key={href} href={href} onClick={(e) => scrollToAnchor(e, href)}>
                {label}
              </a>
            ) : (
              <Link key={href} to={href}>
                {label}
              </Link>
            )
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

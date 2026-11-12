import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSplash } from '../context/SplashContext'
import LegalDialog from './LegalDialog'

const NAV_ITEMS = [
  { href: '/katalog', label: 'Werkverzeichnis' },
  { href: '/#ausstellung', label: 'Ausstellung', section: 'ausstellung' },
  { href: '/#artist', label: 'Künstlerin', section: 'artist' },
  { href: '/#contact', label: 'Kontakt', section: 'contact' },
]

const LEGAL_LINKS = [
  { key: 'imprint', label: 'Impressum' },
  { key: 'privacy', label: 'Datenschutz' },
  { key: 'cookies', label: 'Cookie-Hinweis' },
]

function scrollToSection(sectionId, behavior = 'smooth') {
  const el = document.getElementById(sectionId)
  if (el) el.scrollIntoView({ behavior, block: 'start' })
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { splashVisible } = useSplash()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const [legal, setLegal] = useState(null)

  const closeLegal = useCallback(() => setLegal(null), [])
  const isWork = location.pathname.startsWith('/werk/')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const contact = document.getElementById('contact')
      const nearContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.9 : false
      setShowFab(window.scrollY > window.innerHeight * 0.8 && !nearContact)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)')
    const onChange = () => mq.matches && setMenuOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    if (!menuOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Arriving from another route with a section to scroll to.
  useEffect(() => {
    const sectionId = location.state?.scrollTo
    if (location.pathname !== '/' || !sectionId) return undefined
    const rafId = window.requestAnimationFrame(() => scrollToSection(sectionId))
    navigate(location.pathname, { replace: true, state: null })
    return () => window.cancelAnimationFrame(rafId)
  }, [location.pathname, location.state, navigate])

  // A new route without a section target starts at the top.
  useEffect(() => {
    if (!location.state?.scrollTo && !location.hash) window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const goToSection = (e, section) => {
    setMenuOpen(false)
    if (!section) return
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: section } })
      return
    }
    scrollToSection(section)
  }

  const renderLink = (item, extra = {}) =>
    item.section ? (
      <a key={item.href} href={item.href} onClick={(e) => goToSection(e, item.section)} {...extra}>
        {item.label}
      </a>
    ) : (
      <Link
        key={item.href}
        to={item.href}
        className={location.pathname === item.href ? 'is-active' : ''}
        aria-current={location.pathname === item.href ? 'page' : undefined}
        onClick={() => setMenuOpen(false)}
        {...extra}
      >
        {item.label}
      </Link>
    )

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Zum Inhalt springen
      </a>

      {!splashVisible && (
        <header className={`masthead${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
          <Link to="/" className="masthead__brand" onClick={() => setMenuOpen(false)}>
            <span className="masthead__name">Gabriele Wenger-Scherb</span>
            <span className="masthead__tag">Malerei</span>
          </Link>

          <nav className="masthead__nav" aria-label="Hauptnavigation">
            {NAV_ITEMS.map((item) => renderLink(item))}
          </nav>

          <a
            href="/#contact"
            className="masthead__cta"
            onClick={(e) => goToSection(e, 'contact')}
          >
            Anfrage
          </a>

          <button
            type="button"
            className="masthead__toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? 'Schließen' : 'Menü'}
          </button>
        </header>
      )}

      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile Navigation">
          {NAV_ITEMS.map((item) => renderLink(item, { tabIndex: menuOpen ? 0 : -1 }))}
        </nav>
        <a
          href="/#contact"
          className="btn btn--accent btn--block"
          tabIndex={menuOpen ? 0 : -1}
          onClick={(e) => goToSection(e, 'contact')}
        >
          Anfrage stellen
        </a>
      </div>

      <main id="main">
        <Outlet />
      </main>

      {!splashVisible && !isWork && (
        <a
          href="/#contact"
          className={`fab${showFab ? ' is-visible' : ''}`}
          onClick={(e) => goToSection(e, 'contact')}
          tabIndex={showFab ? 0 : -1}
          aria-hidden={!showFab}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5h14v10H3z M3 5l7 6 7-6" />
          </svg>
          Anfrage
        </a>
      )}

      {!splashVisible && (
        <footer className="colophon" aria-label="Rechtliche Informationen">
          <div className="colophon__inner">
            <p className="colophon__mark">Gabriele Wenger-Scherb</p>
            <p className="colophon__meta">© {new Date().getFullYear()} · Alle Bilder urheberrechtlich geschützt</p>
            <nav className="colophon__links" aria-label="Rechtliche Links">
              {LEGAL_LINKS.map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setLegal(key)}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </footer>
      )}

      {legal && <LegalDialog which={legal} onClose={closeLegal} />}
    </div>
  )
}

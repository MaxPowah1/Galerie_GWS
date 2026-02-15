import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import artistPhoto from '../assets/Artist/Artist_foto.png'
import artistPhotoPose2 from '../assets/Artist/Artist_pose_2.png'
import { paintings } from '../data/paintings'

function wrapIndex(index, length) {
  if (length === 0) return 0
  return (index + length) % length
}

export default function Home() {
  const paired = paintings
  const [scrollY, setScrollY] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [splashClosing, setSplashClosing] = useState(false)
  const [stageView, setStageView] = useState('scenario')
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomedIndex, setZoomedIndex] = useState(null)

  const WERKUEBERSICHT_WALL_COUNT = 10
  const werkuebersichtWallPaintings = paired.slice(0, WERKUEBERSICHT_WALL_COUNT)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMediaChange = () => setReduceMotion(mediaQuery.matches)
    onMediaChange()
    mediaQuery.addEventListener('change', onMediaChange)
    return () => mediaQuery.removeEventListener('change', onMediaChange)
  }, [])

  useEffect(() => {
    if (!showSplash) return undefined
    const visibleDuration = 8200
    const fadeDuration = 1400
    const hideTimer = window.setTimeout(() => setSplashClosing(true), visibleDuration)
    const cleanupTimer = window.setTimeout(() => setShowSplash(false), visibleDuration + fadeDuration)
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(cleanupTimer)
    }
  }, [reduceMotion, showSplash])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main section'))
    const revealItems = []
    const sequenceStepMs = 220

    sections.forEach((section) => {
      const sectionItems = Array.from(section.querySelectorAll('[data-reveal]'))
      sectionItems.forEach((el, idx) => {
        const baseDelay = Number(el.getAttribute('data-reveal-delay')) || 0
        const sequencedDelay = baseDelay + idx * sequenceStepMs
        el.style.setProperty('--reveal-delay', `${sequencedDelay}ms`)
      })
      revealItems.push(...sectionItems)
    })

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [paired.length])

  const showPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? paired.length - 1 : prev - 1))
  }, [paired.length])

  const showNext = useCallback(() => {
    setActiveIndex((prev) => (prev === paired.length - 1 ? 0 : prev + 1))
  }, [paired.length])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setZoomedIndex(null)
        return
      }
      if (zoomedIndex !== null) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        showPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        showNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [zoomedIndex, showPrevious, showNext])

  useEffect(() => {
    if (showSplash || zoomedIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showSplash, zoomedIndex])

  const parallax = useMemo(() => {
    if (reduceMotion) {
      return { heroHeadline: 0, heroStatement: 0 }
    }
    return {
      heroHeadline: scrollY * -0.08,
      heroStatement: scrollY * -0.04,
    }
  }, [reduceMotion, scrollY])

  const activePainting = paired[activeIndex] || null
  const orbitSlots = useMemo(() => {
    if (!paired.length) return []
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const index = wrapIndex(activeIndex + offset, paired.length)
      return {
        offset,
        index,
        work: paired[index],
      }
    })
  }, [activeIndex, paired])

  const focusPainting = (index, { scrollToPortfolio = false } = {}) => {
    setActiveIndex(index)
    if (scrollToPortfolio) {
      const stage = document.getElementById('portfolio-lab')
      if (stage) stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }

  const touchStartRef = useRef({ x: 0 })
  const SWIPE_THRESHOLD = 50

  const handleStageClick = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const mid = rect.width / 2
    if (x < mid) showPrevious()
    else showNext()
  }

  const handleStageTouchStart = (e) => {
    touchStartRef.current.x = e.touches[0]?.clientX ?? 0
  }

  const handleStageTouchEnd = (e) => {
    const startX = touchStartRef.current.x
    const endX = e.changedTouches[0]?.clientX ?? startX
    const diff = startX - endX
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) showNext()
      else showPrevious()
    }
  }

  const signaturePath = 'M80 100 C 200 100, 280 40, 380 80 C 420 100, 380 140, 320 120 C 260 100, 300 60, 420 60 C 580 60, 700 80, 820 90'

  return (
    <>
      {showSplash && (
        <div className={`splash-screen${splashClosing ? ' is-leaving' : ''}`} aria-hidden="true">
          <div className="splash-screen__composition">
            <p className="splash-screen__title">Gabriele Wenger-Scherb</p>
            <svg className="splash-screen__signature" viewBox="0 0 900 220" role="presentation" focusable="false">
              <path pathLength="2200" d={signaturePath} />
              <circle className="splash-screen__pen" r="3.6" cx="-999" cy="-999">
                <animateMotion
                  dur="6.4s"
                  begin="0.35s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.2 0.9 0.22 1"
                  keyTimes="0;1"
                  path={signaturePath}
                />
              </circle>
            </svg>
          </div>
        </div>
      )}

      <section className="hero" aria-label="Einführung">
        <div className="hero__intro" data-reveal="up">
          <p className="hero__eyebrow" style={{ transform: `translate3d(0, ${parallax.heroStatement}px, 0)` }}>
            Zeitgenössische Malerei
          </p>
          <h1 className="hero__title" style={{ transform: `translate3d(0, ${parallax.heroHeadline}px, 0)` }}>
            Gabriele Wenger-Scherb
          </h1>
          <p className="hero__tagline" style={{ transform: `translate3d(0, ${parallax.heroStatement}px, 0)` }}>
            Galerie für zeitgenössische Malerei
          </p>
          <p className="hero__statement">
            Ich male die Welt, wie sie ist – ungefiltert und voller Farbe. Vom Chaos eines Walddickichts bis zur stillen Geometrie einer Wohnwagensiedlung in der Dämmerung: Meine Kunst feiert die Texturen des modernen Lebens und lädt zum Innehalten und genauen Hinsehen ein.
          </p>
          <a href="#portfolio-lab" className="btn btn--dark" data-reveal="up" data-reveal-delay="180">
            Zu den Werken
          </a>
        </div>
        <figure className="hero__image-wrap" data-reveal="right">
          <img src={artistPhoto} alt="Gabriele Wenger-Scherb, Künstlerin" className="hero__image" />
        </figure>
      </section>

      {activePainting && (
        <section id="portfolio-lab" className="portfolio-lab">
          <div className="section-head" data-reveal="up">
            <p className="section-label">Impressionen</p>
            <p className="section-note">
              Werke durchblättern (Bild links/rechts anklicken oder Pfeiltasten), Perspektiven wechseln und eine eigene Reihenfolge entdecken.
            </p>
          </div>
          <div className="portfolio-lab__layout" data-reveal="scale" data-reveal-delay="80">
            <div className="portfolio-lab__stage-wrap">
              <div className="portfolio-lab__mode" role="tablist" aria-label="Ansicht der Arbeit">
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageView === 'scenario'}
                  className={stageView === 'scenario' ? 'is-active' : ''}
                  onClick={() => setStageView('scenario')}
                >
                  Atmosphäre
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageView === 'split'}
                  className={stageView === 'split' ? 'is-active' : ''}
                  onClick={() => setStageView('split')}
                >
                  Diptychon
                </button>
              </div>

              {stageView === 'split' ? (
                <div
                  className="portfolio-lab__stage portfolio-lab__stage--split"
                  onClick={handleStageClick}
                  onTouchStart={handleStageTouchStart}
                  onTouchEnd={handleStageTouchEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      showNext()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Links: vorheriges Werk, Rechts: nächstes Werk"
                >
                  <figure className="portfolio-lab__panel">
                    <img src={activePainting.scenarioSrc} alt={`${activePainting.title} im Kontext`} />
                  </figure>
                  <figure className="portfolio-lab__panel">
                    <img src={activePainting.wallSrc} alt={`${activePainting.title} an der Wand`} />
                  </figure>
                </div>
              ) : (
                <div
                  className="portfolio-lab__stage"
                  onClick={handleStageClick}
                  onTouchStart={handleStageTouchStart}
                  onTouchEnd={handleStageTouchEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      showNext()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Links: vorheriges Werk, Rechts: nächstes Werk"
                >
                  <img
                    src={activePainting.scenarioSrc}
                    alt={`${activePainting.title} im Kontext`}
                  />
                </div>
              )}
            </div>

            <aside className="portfolio-lab__meta">
              <div className="portfolio-lab__meta-header">
                <span className="portfolio-lab__index">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(paired.length).padStart(2, '0')}
                </span>
                <h3 className="portfolio-lab__title">{activePainting.title}</h3>
              </div>

              <div className="portfolio-lab__nav">
                <button type="button" onClick={showPrevious} aria-label="Vorheriges Werk">
                  ←
                </button>
                <button type="button" onClick={showNext} aria-label="Nächstes Werk">
                  →
                </button>
              </div>

              <p className="portfolio-lab__description">
                {stageView === 'split'
                  ? 'Zwei Realitäten zugleich: Atmosphäre im Raum und architektonische Präsenz.'
                  : 'Das Werk in seinem Kontext – Licht und Distanz prägen die Lesart.'}
              </p>

              <div className="portfolio-lab__orbit" aria-label="Benachbarte Werke">
                {orbitSlots.map(({ offset, index, work }) => (
                  <button
                    key={`${work.id}-${offset}`}
                    type="button"
                    onClick={() => focusPainting(index)}
                    className={`orbit-node${offset === 0 ? ' is-active' : ''}`}
                    style={{ '--depth': Math.abs(offset) }}
                    aria-label={`${work.title} auswählen`}
                  >
                    <img src={work.scenarioSrc} alt="" aria-hidden="true" loading="lazy" />
                    <span>{work.title}</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>

          <div className="portfolio-lab__constellation" data-reveal="up" data-reveal-delay="120">
            <p className="portfolio-lab__constellation-title">Werkübersicht</p>
            <p className="portfolio-lab__constellation-subline">
              Eine Auswahl meiner Arbeiten. Die vollständige Werkschau finden Sie im Katalog.
            </p>
            <div className="portfolio-lab__constellation-nav-wrap">
              <div className="portfolio-lab__constellation-grid portfolio-lab__constellation-grid--12">
                {werkuebersichtWallPaintings.map((art, index) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => {
                      focusPainting(index)
                      setZoomedIndex(index)
                    }}
                    className={`constellation-card${index === activeIndex ? ' is-active' : ''}`}
                  >
                    <img src={art.wallSrc} alt={`${art.title} Vorschau`} loading="lazy" />
                    <span>{art.title}</span>
                  </button>
                ))}
                {(paired.length >= 12 ? paired.slice(10, 11) : paired.slice(-2, -1)).map((art) => (
                  <Link
                    key="catalogue"
                    to="/katalog"
                    className="constellation-card constellation-card--catalogue"
                    aria-label="Im Katalog finden Sie eine komplette Übersicht aller Bilder"
                  >
                    <span className="constellation-card__img-wrap">
                      <img src={art.wallSrc} alt="" loading="lazy" />
                      <span className="constellation-card__catalogue-overlay-bg" aria-hidden="true" />
                      <span className="constellation-card__catalogue-overlay">
                        Im Katalog finden Sie eine komplette Übersicht aller Bilder
                      </span>
                    </span>
                    <span className="constellation-card__caption">zum Katalog →</span>
                  </Link>
                ))}
                <Link
                  to="/katalog"
                  className="constellation-card constellation-card--dots"
                  aria-label="Zum Katalog"
                >
                  <span className="constellation-card__img-wrap constellation-card__img-wrap--dots">
                    <span className="constellation-card__dots">zum Katalog →</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="artist" className="artist">
        <p className="section-label" data-reveal="left">Künstlerin</p>
        <div className="artist__layout">
          <div className="artist__text" data-reveal="left">
            <h2>Gabriele Wenger-Scherb</h2>
            <p>
              Meine Kunst ist eine Erkundung der Momente, die wir normalerweise übersehen – der Stapel Wäsche in der Ecke, der Blick aus einem Lastwagen auf einer einsamen Autobahn oder die stille Konzentration eines Menschen bei der Arbeit. Mich fasziniert die Schnittstelle zwischen dem Häuslichen und dem Ungezähmten. Durch kräftige Pinselstriche und eine lebendige Farbpalette übersetze ich die physische Präsenz meiner Umgebung in eine Bildsprache, die sich zugleich vertraut und surreal anfühlt.
            </p>
            <p>
              Jedes Gemälde ist das Protokoll einer bestimmten Atmosphäre. Ob es das kühle, schattige Licht einer Gasse oder die verschlungene Komplexität eines Waldbodens ist – mein Ziel ist es, das „Gefühl" eines Ortes einzufangen, nicht nur sein Abbild. Ich lade den Betrachter ein, die Schönheit im Unordentlichen, im Industriellen und im Alltäglichen zu entdecken.
            </p>
            <p>
              Geprägt von der Liebe zu expressiven Texturen und gesättigten Farben bewegt sich meine Arbeit zwischen darstellender Porträtkunst und atmosphärischer Abstraktion. Ich nutze starke Lichtkontraste und einen satten, malerischen Farbauftrag, um meinen Motiven eine spürbare Präsenz und Beständigkeit zu verleihen.
            </p>
            <p>
              Zentrale Themen meiner Arbeit sind die Schönheit des Profanen – die Transformation von Pappkartons und Haushaltsgegenständen in skulpturale Studien –, Übergangsräume wie Straßen, Gassen und die Randbereiche unseres täglichen Lebens sowie menschliche Momente: Porträts von Figuren in Augenblicken ungestellter, authentischer Reflexion.
            </p>
            <p>
              Ein Gemälde muss für mich lebendig wirken. Indem ich sichtbare Pinselstriche und eine mutige, teils unerwartete Farbenlehre betone, schaffe ich Werke, die zum Innehalten und genauen Hinsehen einladen.
            </p>
          </div>
          <div className="artist__photo-wrap" data-reveal="right" data-reveal-delay="150">
            <img
              src={artistPhotoPose2}
              alt="Gabriele Wenger-Scherb, Künstlerin"
              className="artist__photo"
            />
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <p className="section-label" data-reveal="fade">Kontakt</p>
        <div data-reveal="fade" data-reveal-delay="80">
          <h2>Anfragen & Kooperationen</h2>
          <p>
            Für Ausstellungen, Preise, Auftragsarbeiten und Studio-Anfragen freue ich mich über Ihre Nachricht.
          </p>
          <a className="btn btn--dark" href="mailto:studio@example.com">
            gabriele@example.com
          </a>
        </div>
      </section>

      {zoomedIndex !== null && paired[zoomedIndex] && (
        <div
          className="constellation-lightbox"
          onClick={() => setZoomedIndex(null)}
          onKeyDown={(e) => e.key === 'Enter' && setZoomedIndex(null)}
          role="button"
          tabIndex={0}
          aria-label="Vergrößertes Bild schließen"
        >
          <div className="constellation-lightbox__backdrop" />
          <figure
            className="constellation-lightbox__figure"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={paired[zoomedIndex].wallSrc}
              alt={`${paired[zoomedIndex].title} vergrößert`}
            />
            <figcaption>{paired[zoomedIndex].title}</figcaption>
          </figure>
        </div>
      )}
    </>
  )
}

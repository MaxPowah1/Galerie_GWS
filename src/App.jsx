import { useEffect, useMemo, useState } from 'react'
import './App.css'
import artistPhoto from './assets/Artist/Artist_foto.png'
import artistPhotoPose2 from './assets/Artist/Artist_pose_2.png'

// Load scenario images (in-situ) and wall images (frontal on wall)
const szenarioModules = import.meta.glob('./assets/Szenarios/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const wallModules = import.meta.glob('./assets/painting_on_wall/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

/** Extract numeric base name from path, e.g. "./assets/Szenarios/1.png" -> 1 */
function baseName(path) {
  const name = path.split(/[/\\]/).pop() || ''
  return name.replace(/\.[^.]+$/, '')
}

/** Build paired paintings: each entry has scenario + wall image by matching number */
function buildPaintings() {
  const byNum = (modules) => {
    const out = {}
    Object.entries(modules).forEach(([path, src]) => {
      const num = baseName(path)
      const n = parseInt(num, 10)
      if (!Number.isNaN(n)) out[n] = src
    })
    return out
  }
  const szenarios = byNum(szenarioModules)
  const walls = byNum(wallModules)
  const numbers = [...new Set([...Object.keys(szenarios).map(Number), ...Object.keys(walls).map(Number)])].sort((a, b) => a - b)
  return numbers
    .filter((n) => szenarios[n] && walls[n])
    .map((n, index) => ({
      id: index + 1,
      number: n,
      scenarioSrc: szenarios[n],
      wallSrc: walls[n],
      title: `Werk ${String(n).padStart(2, '0')}`,
    }))
}

const paintings = buildPaintings()

/** Fonts to try for "Galerie" branding — cycle with the font picker */
const FONT_OPTIONS = [
  { name: 'Instrument Serif', family: "'Instrument Serif', serif" },
  { name: 'Bodoni Moda', family: "'Bodoni Moda', serif" },
  { name: 'Bodoni Moda SC', family: "'Bodoni Moda SC', serif" },
  { name: 'Smooch Sans', family: "'Smooch Sans', sans-serif" },
  { name: 'Noto Serif Display', family: "'Noto Serif Display', serif" },
  { name: 'Major Mono Display', family: "'Major Mono Display', monospace" },
  { name: 'Megrim', family: "'Megrim', cursive" },
]

function wrapIndex(index, length) {
  if (length === 0) return 0
  return (index + length) % length
}

function App() {
  const paired = paintings
  const [scrollY, setScrollY] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [stageView, setStageView] = useState('scenario')
  const [activeIndex, setActiveIndex] = useState(0)
  const [fontIndex, setFontIndex] = useState(0)
  const currentFont = FONT_OPTIONS[fontIndex]

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMediaChange = () => setReduceMotion(mediaQuery.matches)
    onMediaChange()
    mediaQuery.addEventListener('change', onMediaChange)
    return () => mediaQuery.removeEventListener('change', onMediaChange)
  }, [])

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
    const revealElements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    revealElements.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [paired.length])

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

  const focusPainting = (index) => {
    setActiveIndex(index)
    const stage = document.getElementById('portfolio-lab')
    if (stage) stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const showPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? paired.length - 1 : prev - 1))
  }

  const showNext = () => {
    setActiveIndex((prev) => (prev === paired.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="site-shell" style={{ '--font-heading': currentFont.family }}>
      <header className="topbar">
        <p className="topbar__name">Gabriele Wenger-Scherb</p>
        <nav className="topbar__nav" aria-label="Hauptnavigation">
          <a href="#portfolio-lab">Werke</a>
          <a href="#artist">Künstlerin</a>
          <a href="#contact">Kontakt</a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-label="Einführung">
          <div className="hero__intro" data-reveal>
            <p className="hero__eyebrow" style={{ transform: `translate3d(0, ${parallax.heroStatement}px, 0)` }}>
              Portfolio Malerei
            </p>
            <p className="hero__galerie-preview" style={{ transform: `translate3d(0, ${parallax.heroHeadline}px, 0)` }}>
              Galerie
            </p>
            <h1 className="hero__title" style={{ transform: `translate3d(0, ${parallax.heroHeadline}px, 0)` }}>
              Gabriele Wenger-Scherb
            </h1>
            <p className="hero__statement">
              Modern. Roh. Lebendig. Ich male die Welt, wie sie ist – ungefiltert und voller Farbe. Vom Chaos eines Walddickichts bis zur stillen Geometrie einer Wohnwagensiedlung in der Dämmerung: Meine Kunst feiert die Texturen des modernen Lebens und lädt zum Innehalten und genauen Hinsehen ein.
            </p>
            <a href="#portfolio-lab" className="btn btn--dark">
              Zu den Werken
            </a>
          </div>
          <figure className="hero__image-wrap" data-reveal>
            <img src={artistPhoto} alt="Gabriele Wenger-Scherb, Künstlerin" className="hero__image" />
          </figure>
        </section>

        {activePainting && (
          <section id="portfolio-lab" className="portfolio-lab" data-reveal>
            <div className="section-head">
              <p className="section-label">Portfolio</p>
              <p className="section-note">
                Werke durchblättern, Perspektiven wechseln und eine eigene Reihenfolge entdecken.
              </p>
            </div>
            <div className="portfolio-lab__layout">
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
                  <button
                    type="button"
                    role="tab"
                    aria-selected={stageView === 'wall'}
                    className={stageView === 'wall' ? 'is-active' : ''}
                    onClick={() => setStageView('wall')}
                  >
                    Präsenz
                  </button>
                </div>

                {stageView === 'split' ? (
                  <div className="portfolio-lab__stage portfolio-lab__stage--split">
                    <figure className="portfolio-lab__panel">
                      <img src={activePainting.scenarioSrc} alt={`${activePainting.title} im Kontext`} />
                    </figure>
                    <figure className="portfolio-lab__panel">
                      <img src={activePainting.wallSrc} alt={`${activePainting.title} an der Wand`} />
                    </figure>
                  </div>
                ) : (
                  <div className="portfolio-lab__stage">
                    <img
                      src={stageView === 'scenario' ? activePainting.scenarioSrc : activePainting.wallSrc}
                      alt={`${activePainting.title} ${stageView === 'scenario' ? 'im Kontext' : 'an der Wand'}`}
                    />
                  </div>
                )}
              </div>

              <aside className="portfolio-lab__meta">
                <p className="portfolio-lab__title">{activePainting.title}</p>
                <p className="portfolio-lab__index">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(paired.length).padStart(2, '0')}
                </p>
                <p className="portfolio-lab__description">
                  {stageView === 'split'
                    ? 'Zwei Realitäten zugleich: Atmosphäre im Raum und architektonische Präsenz.'
                    : stageView === 'scenario'
                      ? 'Das Werk in seinem Kontext – Licht und Distanz prägen die Lesart.'
                      : 'Das Bild tritt dem Raum direkt gegenüber, Materialität und Kanten stehen im Vordergrund.'}
                </p>

                <div className="portfolio-lab__nav">
                  <button type="button" onClick={showPrevious}>
                    Zurück
                  </button>
                  <button type="button" onClick={showNext}>
                    Weiter
                  </button>
                </div>

                <div className="portfolio-lab__orbit" aria-label="Benachbarte Werke">
                  {orbitSlots.map(({ offset, index, work }) => (
                    <button
                      key={`${work.id}-${offset}`}
                      type="button"
                      onClick={() => focusPainting(index)}
                      className={`orbit-node${offset === 0 ? ' is-active' : ''}`}
                      style={
                        {
                          '--offset': offset,
                          '--depth': Math.abs(offset),
                        }
                      }
                      aria-label={`${work.title} auswählen`}
                    >
                      <img src={work.wallSrc} alt="" aria-hidden="true" loading="lazy" />
                      <span>{work.title}</span>
                    </button>
                  ))}
                </div>
              </aside>
            </div>

            <div className="portfolio-lab__constellation">
              <p className="portfolio-lab__constellation-title">Werkübersicht</p>
              <div className="portfolio-lab__constellation-grid">
                {paired.map((art, index) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => focusPainting(index)}
                    className={`constellation-card${index === activeIndex ? ' is-active' : ''}`}
                  >
                    <img src={index % 2 === 0 ? art.scenarioSrc : art.wallSrc} alt={`${art.title} Vorschau`} loading="lazy" />
                    <span>{art.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="artist" className="artist" data-reveal>
          <p className="section-label">Künstlerin</p>
          <div className="artist__layout">
            <div className="artist__text">
              <h2>Gabriele Wenger-Scherb</h2>
              <p>
                Meine Kunst ist eine Erkundung der Momente, die wir normalerweise übersehen – der Stapel Wäsche in der Ecke, der Blick aus einem Lastwagen auf einer einsamen Autobahn oder die stille Konzentration eines Menschen bei der Arbeit. Mich fasziniert die Schnittstelle zwischen dem Häuslichen und dem Ungezähmten. Durch kräftige Pinselstriche und eine lebendige Farbpalette übersetze ich die physische Präsenz meiner Umgebung in eine Bildsprache, die sich zugleich vertraut und surreal anfühlt.
              </p>
              <p>
                Jedes Gemälde ist das Protokoll einer bestimmten Atmosphäre. Ob es das kühle, schattige Licht einer Gasse oder die verschlungene Komplexität eines Waldbodens ist – mein Ziel ist es, das „Gefühl“ eines Ortes einzufangen, nicht nur sein Abbild. Ich lade den Betrachter ein, die Schönheit im Unordentlichen, im Industriellen und im Alltäglichen zu entdecken.
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
            <div className="artist__photo-wrap">
              <img
                src={artistPhotoPose2}
                alt="Gabriele Wenger-Scherb, Künstlerin"
                className="artist__photo"
              />
            </div>
          </div>
        </section>

        <section id="contact" className="contact" data-reveal>
          <p className="section-label">Kontakt</p>
          <h2>Anfragen & Kooperationen</h2>
          <p>
            Für Ausstellungen, Preise, Auftragsarbeiten und Studio-Anfragen freue ich mich über Ihre Nachricht.
          </p>
          <a className="btn btn--dark" href="mailto:studio@example.com">
            gabriele@example.com
          </a>
        </section>
      </main>
    </div>
  )
}

export default App

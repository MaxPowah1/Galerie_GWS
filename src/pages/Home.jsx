import { useEffect, useState } from 'react'
import { paintings } from '../data/paintings'
import artistPhoto from '../assets/Artist/Artist_foto.png'
import artistPhotoPose2 from '../assets/Artist/Artist_pose_2.png'

function wrapIndex(index, length) {
  if (length === 0) return 0
  return (index + length) % length
}

export function HeroSection() {
  return (
    <section className="hero" aria-label="Einfuehrung">
      <div className="hero__intro">
        <p className="hero__eyebrow">Moderne Galerie</p>
        <h1 className="hero__title">Gabriele Wenger-Scherb</h1>
        <p className="hero__statement">
          Reduzierte Praesentation. Ein Werk pro Moment. Volle Konzentration auf Bild, Licht und Materialitaet.
        </p>
        <div className="hero__actions">
          <a href="#portfolio" className="btn btn--solid">
            Zur Galerie
          </a>
        </div>
      </div>
      <figure className="hero__portrait">
        <img src={artistPhoto} alt="Gabriele Wenger-Scherb, Kuenstlerin" className="hero__image" />
      </figure>
    </section>
  )
}

export function SpotlightSection() {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewMode, setViewMode] = useState('scenario')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReduceMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  const featuredPaintings = paintings.slice(0, 5)
  const activePainting = featuredPaintings[activeIndex] || null
  const activeImage = activePainting
    ? viewMode === 'wall'
      ? activePainting.wallSrc
      : activePainting.scenarioSrc
    : null

  if (!activePainting) return null

  return (
    <section className="spotlight" aria-label="Galerie Fokus">
      <div className="spotlight__head">
        <p className="label">Highlights</p>
        <h2>Ausgewaehlte Werke im Fokus.</h2>
        <p className="spotlight__lede">
          Eine kuratierte Auswahl als Einstieg. Die komplette Werkschau finden Sie im Katalog.
        </p>
      </div>
      <div className="spotlight__layout">
        <div className="spotlight__stage">
          <div className="spotlight__toggle" role="tablist" aria-label="Ansicht wechseln">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'scenario'}
              className={viewMode === 'scenario' ? 'is-active' : ''}
              onClick={() => setViewMode('scenario')}
            >
              Kontext
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'wall'}
              className={viewMode === 'wall' ? 'is-active' : ''}
              onClick={() => setViewMode('wall')}
            >
              Wand
            </button>
          </div>
          <figure className="spotlight__image-wrap">
            <img
              key={`${activePainting.id}-${viewMode}`}
              src={activeImage}
              alt={activePainting.title}
              className={`spotlight__image${reduceMotion ? ' no-motion' : ''}`}
            />
          </figure>
        </div>
        <aside className="spotlight__meta">
          <p className="spotlight__index">
            Highlight {String(activeIndex + 1).padStart(2, '0')} / {String(featuredPaintings.length).padStart(2, '0')}
          </p>
          <p className="spotlight__title">{activePainting.title}</p>
          <div className="spotlight__nav">
            <button type="button" onClick={() => setActiveIndex((prev) => wrapIndex(prev - 1, featuredPaintings.length))}>
              Zurueck
            </button>
            <button type="button" onClick={() => setActiveIndex((prev) => wrapIndex(prev + 1, featuredPaintings.length))}>
              Weiter
            </button>
          </div>
          <div className="spotlight__highlights" aria-label="Highlight-Auswahl">
            {featuredPaintings.map((work, index) => (
              <button
                key={work.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`spotlight__highlight-item${index === activeIndex ? ' is-active' : ''}`}
                aria-label={`${work.title} als Highlight anzeigen`}
              >
                <span className="spotlight__highlight-number">{String(work.number).padStart(2, '0')}</span>
                <span className="spotlight__highlight-title">{work.title}</span>
              </button>
            ))}
          </div>
          <a className="btn spotlight__catalogue-cta" href="/katalog">
            Alle Werke im Katalog
          </a>
        </aside>
      </div>
    </section>
  )
}

export function ManifestSection() {
  return (
    <section className="manifest" aria-label="Kuenstlerin">
      <div className="manifest__image">
        <img src={artistPhotoPose2} alt="Portrat von Gabriele Wenger-Scherb" />
      </div>
      <div className="manifest__text">
        <p className="label">Kuenstlerin</p>
        <h2>Malerei zwischen Alltag und Intensitaet.</h2>
        <p>
          Ich arbeite mit klaren Kontrasten, sichtbaren Pinselspuren und praeziser Verdichtung von Stimmung.
          Die Werke sind als ruhige Sequenz aufgebaut, damit jedes Bild seinen eigenen Raum bekommt.
        </p>
      </div>
    </section>
  )
}

export function ContactSection() {
  return (
    <section className="contact">
      <p className="label">Kontakt</p>
      <h2>Ausstellungen und Anfragen</h2>
      <p>Fuer Kooperationen, Preise und Studio-Anfragen direkt per E-Mail.</p>
      <a className="btn btn--solid" href="mailto:gabriele@example.com">
        gabriele@example.com
      </a>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <SpotlightSection />
      <ManifestSection />
      <ContactSection />
    </>
  )
}

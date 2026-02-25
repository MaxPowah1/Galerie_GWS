import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { paintings } from '../data/paintings'

export default function Catalogue() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('split')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [lightboxView, setLightboxView] = useState('wall')
  const total = paintings.length

  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'Maße folgen'
    const { widthCm, heightCm } = dimensions
    if (!widthCm || !heightCm) return 'Maße folgen'
    return `${heightCm} x ${widthCm} cm (H x B)`
  }

  const goToGallery = () => {
    navigate('/', { state: { scrollTo: 'portfolio-lab' } })
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxView('wall')
  }

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goToPrevious = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + paintings.length) % paintings.length))
  }, [paintings.length])

  const goToNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % paintings.length))
  }, [paintings.length])

  const cycleLightboxView = useCallback(() => {
    setLightboxView((v) => (v === 'wall' ? 'scenario' : v === 'scenario' ? 'split' : 'wall'))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') goToPrevious()
      else if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeLightbox, lightboxIndex, goToPrevious, goToNext])

  useEffect(() => {
    const items = document.querySelectorAll('[data-catalogue-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [total])

  return (
    <div className="catalogue-page">
      <section className="catalogue-hero" data-catalogue-reveal>
        <div className="catalogue-hero__content">
          <p className="catalogue-hero__label">Katalog</p>
          <h1 className="catalogue-hero__title">Alle Werke</h1>
          <p className="catalogue-hero__lede">
            Entdecken Sie die vollständige Werkschau. Jedes Gemälde in zwei Perspektiven: im Raum und an der Wand.
          </p>
          <div className="catalogue-hero__actions">
            <button type="button" className="btn btn--dark catalogue-hero__cta" onClick={goToGallery}>
              Zurück zur Galerie
            </button>
          </div>
        </div>
      </section>

      <div className="catalogue-toggle" role="tablist" aria-label="Ansicht wählen" data-catalogue-reveal>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'split'}
          className={viewMode === 'split' ? 'is-active' : ''}
          onClick={() => setViewMode('split')}
        >
          Beide Ansichten
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'scenario'}
          className={viewMode === 'scenario' ? 'is-active' : ''}
          onClick={() => setViewMode('scenario')}
        >
          Im Raum
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'wall'}
          className={viewMode === 'wall' ? 'is-active' : ''}
          onClick={() => setViewMode('wall')}
        >
          An der Wand
        </button>
      </div>

      <ul className="catalogue-grid" aria-label="Werkliste">
        {paintings.map((work, index) => (
          <li key={work.id} className="catalogue-grid__item" data-catalogue-reveal>
            <article className="catalogue-card">
              <div
                className="catalogue-card__images"
                role="button"
                tabIndex={0}
                onClick={() => openLightbox(index)}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
                aria-label={`${work.title} vergrößern`}
              >
                {viewMode === 'split' && (
                  <>
                    <figure className="catalogue-card__figure catalogue-card__figure--scenario">
                      <img
                        src={work.scenarioSrc}
                        alt={`${work.title} im Raum`}
                        loading={index < 12 ? 'eager' : 'lazy'}
                      />
                      <figcaption>Im Raum</figcaption>
                    </figure>
                    <figure className="catalogue-card__figure catalogue-card__figure--wall">
                      <img
                        src={work.wallSrc}
                        alt={`${work.title} an der Wand`}
                        loading={index < 12 ? 'eager' : 'lazy'}
                      />
                      <figcaption>An der Wand</figcaption>
                    </figure>
                  </>
                )}
                {viewMode === 'scenario' && (
                  <figure className="catalogue-card__figure catalogue-card__figure--single">
                    <img
                      src={work.scenarioSrc}
                      alt={`${work.title} im Raum`}
                      loading={index < 12 ? 'eager' : 'lazy'}
                    />
                  </figure>
                )}
                {viewMode === 'wall' && (
                  <figure className="catalogue-card__figure catalogue-card__figure--single">
                    <img
                      src={work.wallSrc}
                      alt={`${work.title} an der Wand`}
                      loading={index < 12 ? 'eager' : 'lazy'}
                    />
                  </figure>
                )}
              </div>
              <div className="catalogue-card__meta">
                <div className="catalogue-card__headline">
                  <h3 className="catalogue-card__title">{work.title}</h3>
                </div>
                <dl className="catalogue-card__details">
                  <div className="catalogue-card__detail-row">
                    <dt>Preiskategorie</dt>
                    <dd>{work.priceCategory}</dd>
                  </div>
                  <div className="catalogue-card__detail-row">
                    <dt>Technik</dt>
                    <dd>{work.technique}</dd>
                  </div>
                  <div className="catalogue-card__detail-row">
                    <dt>Maße</dt>
                    <dd>{formatDimensions(work.dimensions)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <footer className="catalogue-footer" data-catalogue-reveal>
        <p className="catalogue-footer__text">{total} Werke in dieser Sammlung.</p>
        <button type="button" className="btn btn--dark" onClick={goToGallery}>
          Zurück zur Galerie
        </button>
      </footer>

      {lightboxIndex !== null && paintings[lightboxIndex] && (
        <div
          className="catalogue-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Vergrößerte Ansicht"
        >
          <div className="catalogue-lightbox__backdrop" />
          <div
            className="catalogue-lightbox__panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="catalogue-lightbox__view-toggle" role="tablist" aria-label="Ansicht wählen">
              <button
                type="button"
                role="tab"
                aria-selected={lightboxView === 'wall'}
                className={lightboxView === 'wall' ? 'is-active' : ''}
                onClick={() => setLightboxView('wall')}
              >
                An der Wand
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lightboxView === 'scenario'}
                className={lightboxView === 'scenario' ? 'is-active' : ''}
                onClick={() => setLightboxView('scenario')}
              >
                Im Raum
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lightboxView === 'split'}
                className={lightboxView === 'split' ? 'is-active' : ''}
                onClick={() => setLightboxView('split')}
              >
                Diptychon
              </button>
            </div>
            <div
              className="catalogue-lightbox__content catalogue-lightbox__content--single"
              onClick={cycleLightboxView}
              role="button"
              tabIndex={0}
              aria-label="Klicken zum Wechseln der Ansicht (Wand, Raum, Diptychon)"
            >
              {lightboxView === 'wall' && (
                <figure className="catalogue-lightbox__figure">
                  <img
                    src={paintings[lightboxIndex].wallSrc}
                    alt={`${paintings[lightboxIndex].title} an der Wand`}
                  />
                  <figcaption>{paintings[lightboxIndex].title}</figcaption>
                </figure>
              )}
              {lightboxView === 'scenario' && (
                <figure className="catalogue-lightbox__figure">
                  <img
                    src={paintings[lightboxIndex].scenarioSrc}
                    alt={`${paintings[lightboxIndex].title} im Raum`}
                  />
                  <figcaption>{paintings[lightboxIndex].title}</figcaption>
                </figure>
              )}
              {lightboxView === 'split' && (
                <div className="catalogue-lightbox__diptychon">
                  <figure className="catalogue-lightbox__figure">
                    <img
                      src={paintings[lightboxIndex].scenarioSrc}
                      alt={`${paintings[lightboxIndex].title} im Raum`}
                    />
                    <figcaption>Im Raum</figcaption>
                  </figure>
                  <figure className="catalogue-lightbox__figure">
                    <img
                      src={paintings[lightboxIndex].wallSrc}
                      alt={`${paintings[lightboxIndex].title} an der Wand`}
                    />
                    <figcaption>An der Wand</figcaption>
                  </figure>
                </div>
              )}
            </div>
            <button
              type="button"
              className="catalogue-lightbox__close"
              onClick={closeLightbox}
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

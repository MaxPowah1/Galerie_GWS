import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { paintings } from '../data/paintings'
import { applySeo, toAbsoluteUrl } from '../utils/seo'

export default function Catalogue() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('wall')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [lightboxView, setLightboxView] = useState('wall')
  const total = paintings.length
  const categoryOrder = ['A', 'B', 'C', 'D', 'E', 'F']
  const priceByCategory = {
    A: 'von 400 € bis 600 €',
    B: 'von 700 € bis 900 €',
    C: 'von 1.100 € bis 1.500 €',
    D: 'von 1.600 € bis 2.200 €',
  }
  const priceGuide = [...new Set(paintings.map(({ priceCategory }) => priceCategory).filter(Boolean))]
    .sort((a, b) => {
      const ai = categoryOrder.indexOf(a)
      const bi = categoryOrder.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b, 'de')
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    .map((category) => ({
      category,
      priceLabel: priceByCategory[category] || 'Preis auf Anfrage',
    }))

  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'Maße folgen'
    const { widthCm, heightCm } = dimensions
    if (!widthCm || !heightCm) return 'Maße folgen'
    return `${heightCm} x ${widthCm} cm (H x B)`
  }

  const buildArtworkAlt = (work, context) => {
    const dimensions = formatDimensions(work.dimensions)
    return `${work.title}, ${work.technique}, ${dimensions}, Preiskategorie ${work.priceCategory}, ${context}`
  }

  const collectionJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Katalog - Alle Werke',
      url: toAbsoluteUrl('/katalog'),
      inLanguage: 'de',
      hasPart: paintings.map((work) => ({
        '@type': 'VisualArtwork',
        name: work.title,
        image: toAbsoluteUrl(work.wallSrc),
        artform: 'Malerei',
        artMedium: work.technique,
        width: work.dimensions?.widthCm ? `${work.dimensions.widthCm} cm` : undefined,
        height: work.dimensions?.heightCm ? `${work.dimensions.heightCm} cm` : undefined,
        url: toAbsoluteUrl('/katalog'),
        description: `${work.title}, ${work.technique}, ${formatDimensions(work.dimensions)}, Preiskategorie ${work.priceCategory}.`,
      })),
    }),
    [],
  )

  const goToGallery = () => {
    navigate('/', { state: { scrollTo: 'portfolio-lab' } })
  }

  const goToContact = () => {
    navigate('/', { state: { scrollTo: 'contact' } })
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxView('wall')
  }

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goToPrevious = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + paintings.length) % paintings.length))
  }, [])

  const goToNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % paintings.length))
  }, [])

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

  useEffect(() => {
    applySeo({
      title: 'Katalog - Alle Werke | Gabriele Wenger-Scherb',
      description:
        'Alle Werke von Gabriele Wenger-Scherb im Katalog: Malerei im Raum und an der Wand, inklusive Technik, Masse und Preiskategorie – fuer Sammler in Mittelfranken, Bayern und darueber hinaus.',
      canonicalPath: '/katalog',
      keywords:
        'Kunstkatalog, Gemaelde kaufen, zeitgenoessische Malerei, Galerie, Gabriele Wenger-Scherb, Mittelfranken, Bayern, Kunst kaufen in Mittelfranken',
      ogType: 'article',
      ogImage: toAbsoluteUrl(paintings[0]?.wallSrc),
      jsonLd: collectionJsonLd,
    })
  }, [collectionJsonLd])

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
          Diptychon
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

      <h2 className="catalogue-grid__heading">Werke im Ueberblick</h2>

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
                        alt={buildArtworkAlt(work, 'im Raum')}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                      <figcaption>Im Raum</figcaption>
                    </figure>
                    <figure className="catalogue-card__figure catalogue-card__figure--wall">
                      <img
                        src={work.wallSrc}
                        alt={buildArtworkAlt(work, 'an der Wand')}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                      <figcaption>An der Wand</figcaption>
                    </figure>
                  </>
                )}
                {viewMode === 'scenario' && (
                  <figure className="catalogue-card__figure catalogue-card__figure--single">
                    <img
                      src={work.scenarioSrc}
                      alt={buildArtworkAlt(work, 'im Raum')}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </figure>
                )}
                {viewMode === 'wall' && (
                  <figure className="catalogue-card__figure catalogue-card__figure--single">
                    <img
                      src={work.wallSrc}
                      alt={buildArtworkAlt(work, 'an der Wand')}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </figure>
                )}
              </div>
              <div className="catalogue-card__meta">
                <div className="catalogue-card__headline">
                  <h3 className="catalogue-card__title">{work.displayTitle || work.title}</h3>
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

      <section className="catalogue-pricing" data-catalogue-reveal aria-label="Preiskategorien">
        <div className="catalogue-pricing__intro">
          <h2 className="catalogue-pricing__title">Preiskategorien</h2>
        </div>
        <ul className="catalogue-pricing__list">
          {priceGuide.map(({ category, priceLabel }) => (
            <li key={category} className="catalogue-pricing__item">
              <span className="catalogue-pricing__category">{category}</span>
              <span className="catalogue-pricing__value">{priceLabel}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="catalogue-footer" data-catalogue-reveal>
        <p className="catalogue-footer__text">{total} Werke in dieser Sammlung.</p>
        <button type="button" className="btn btn--dark" onClick={goToGallery}>
          Zurück zur Galerie
        </button>
        <button type="button" className="btn btn--dark" onClick={goToContact}>
          Anfrage stellen
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
                    alt={buildArtworkAlt(paintings[lightboxIndex], 'an der Wand')}
                  />
                  <figcaption>{paintings[lightboxIndex].displayTitle || paintings[lightboxIndex].title}</figcaption>
                </figure>
              )}
              {lightboxView === 'scenario' && (
                <figure className="catalogue-lightbox__figure">
                  <img
                    src={paintings[lightboxIndex].scenarioSrc}
                    alt={buildArtworkAlt(paintings[lightboxIndex], 'im Raum')}
                  />
                  <figcaption>{paintings[lightboxIndex].displayTitle || paintings[lightboxIndex].title}</figcaption>
                </figure>
              )}
              {lightboxView === 'split' && (
                <div className="catalogue-lightbox__diptychon">
                  <figure className="catalogue-lightbox__figure">
                    <img
                      src={paintings[lightboxIndex].scenarioSrc}
                      alt={buildArtworkAlt(paintings[lightboxIndex], 'im Raum')}
                    />
                    <figcaption>Im Raum</figcaption>
                  </figure>
                  <figure className="catalogue-lightbox__figure">
                    <img
                      src={paintings[lightboxIndex].wallSrc}
                      alt={buildArtworkAlt(paintings[lightboxIndex], 'an der Wand')}
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

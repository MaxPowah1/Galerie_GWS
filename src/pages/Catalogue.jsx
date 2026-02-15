import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paintings } from '../data/paintings'

export default function Catalogue() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('split')
  const total = paintings.length

  const goToGallery = () => {
    navigate('/', { state: { scrollTo: 'portfolio-lab' } })
  }

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
              <div className="catalogue-card__images">
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
                <span className="catalogue-card__index">
                  {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <h3 className="catalogue-card__title">{work.title}</h3>
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
    </div>
  )
}

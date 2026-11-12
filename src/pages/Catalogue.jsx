import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { paintings } from '../data/paintings'
import useReveal from '../hooks/useReveal'
import { applySeo, toAbsoluteUrl } from '../utils/seo'
import { formatDimensions } from '../utils/format'

export default function Catalogue() {
  useReveal([])

  const techniques = useMemo(() => [...new Set(paintings.map((w) => w.technique))], [])

  useEffect(() => {
    applySeo({
      title: 'Werke – Alle Gemälde | Gabriele Wenger-Scherb',
      description:
        'Alle Gemälde von Gabriele Wenger-Scherb mit Technik und Maßen – an der Wand und im Raum. Preis und Verfügbarkeit auf Anfrage.',
      canonicalPath: '/katalog',
      keywords:
        'Gemälde kaufen, zeitgenössische Malerei, Galerie, Gabriele Wenger-Scherb, Mittelfranken, Bayern, Kunst kaufen in Mittelfranken',
      ogType: 'website',
      ogImage: toAbsoluteUrl('/og/werke.jpg'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Werke – Gabriele Wenger-Scherb',
        url: toAbsoluteUrl('/katalog'),
        inLanguage: 'de',
        hasPart: paintings.map((w) => ({
          '@type': 'VisualArtwork',
          name: w.title,
          url: toAbsoluteUrl(`/werk/${w.slug}`),
          image: toAbsoluteUrl(w.wall.src),
          artMedium: w.technique,
        })),
      },
    })
  }, [])

  return (
    <div className="catalogue">
      <header className="catalogue__head">
        <p className="eyebrow" data-reveal="fade">
          <Link to="/" className="crumb">
            Galerie
          </Link>{' '}
          / Werke
        </p>
        <h1 className="catalogue__title" data-reveal="up">
          Meine <em>Werke</em>
        </h1>
        <div className="catalogue__intro" data-reveal="up">
          <p className="catalogue__lede">
            Alle Gemälde mit Technik und Maßen. Jedes Bild öffnet seine eigene Seite – mit Großansicht, Wirkung an der
            Wand und im Raum und der Möglichkeit zur Anfrage.
          </p>
          <dl className="catalogue__facts">
            <div>
              <dt>Werke</dt>
              <dd>{paintings.length}</dd>
            </div>
            <div>
              <dt>Techniken</dt>
              <dd>{techniques.join(' · ')}</dd>
            </div>
          </dl>
        </div>
      </header>

      <h2 className="visually-hidden">Alle Werke</h2>
      <ul className="cards cards--catalogue" data-reveal-group>
        {paintings.map((work, i) => {
          const img = work.art || work.wall
          return (
            <li key={work.id} data-reveal="up">
              <Link to={`/werk/${work.slug}`} className="card">
                <span className="card__frame card__frame--art">
                  <img
                    src={img.src}
                    width={img.width}
                    height={img.height}
                    alt={`${work.title}, ${work.technique}, ${formatDimensions(work.dimensions)}`}
                    loading={i < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span className="card__cta" aria-hidden="true">
                    Werk ansehen →
                  </span>
                </span>
                <span className="card__meta">
                  <span className="card__no">{work.label}</span>
                  <span className={`card__title${work.untitled ? ' is-untitled' : ''}`}>{work.title}</span>
                  <span className="card__spec">
                    {work.technique} · {formatDimensions(work.dimensions)}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <footer className="catalogue__end" data-reveal="up">
        <p className="catalogue__end-text">Interesse an einer Arbeit, an Preisen oder einer Auftragsarbeit?</p>
        <div className="catalogue__end-actions">
          <Link to="/" state={{ scrollTo: 'contact' }} className="btn btn--accent">
            Anfrage stellen
          </Link>
          <Link to="/" className="btn btn--ghost">
            Zur Startseite
          </Link>
        </div>
      </footer>
    </div>
  )
}

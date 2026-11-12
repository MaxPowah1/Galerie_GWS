import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findBySlug, paintings } from '../data/paintings'
import Lightbox from '../components/Lightbox'
import useReveal from '../hooks/useReveal'
import { applySeo, toAbsoluteUrl } from '../utils/seo'
import { workInquiry } from '../utils/email'
import { formatDimensions, ORIENTATION_LABEL, pad } from '../utils/format'

const VIEWS = [
  { id: 'art', label: 'Werk' },
  { id: 'wall', label: 'An der Wand' },
  { id: 'room', label: 'Im Raum' },
]

function MeasureDrawing({ work }) {
  const { widthCm, heightCm } = work.dimensions
  if (!widthCm || !heightCm || !work.art) return null
  return (
    <figure className="measure" aria-label={`Maßzeichnung: ${heightCm} cm hoch, ${widthCm} cm breit`}>
      <div className="measure__box" style={{ '--ar': work.art.width / work.art.height }}>
        <span className="measure__w" aria-hidden="true">
          {widthCm} cm
        </span>
        <span className="measure__h" aria-hidden="true">
          {heightCm} cm
        </span>
        <img src={work.art.src} alt="" loading="lazy" decoding="async" />
      </div>
      <figcaption>Maßzeichnung · {ORIENTATION_LABEL[work.orientation]}</figcaption>
    </figure>
  )
}

export default function WorkPage() {
  const { slug } = useParams()
  // Keyed by slug so view/zoom state starts fresh for every work.
  return <Work key={slug} slug={slug} />
}

function Work({ slug }) {
  const work = findBySlug(slug)
  const [view, setView] = useState('art')
  const [zoom, setZoom] = useState(null)
  const [copied, setCopied] = useState(false)

  useReveal([slug])

  const index = work ? paintings.indexOf(work) : -1
  const prev = index >= 0 ? paintings[(index - 1 + paintings.length) % paintings.length] : null
  const next = index >= 0 ? paintings[(index + 1) % paintings.length] : null
  const more = useMemo(
    () => (index >= 0 ? [2, 3, 4, 5].map((o) => paintings[(index + o) % paintings.length]) : []),
    [index],
  )

  const images = useMemo(() => {
    if (!work) return []
    return [
      work.art && { id: 'art', image: work.art, alt: `${work.title} – Werkansicht`, caption: `${work.title} · Werk` },
      { id: 'wall', image: work.wall, alt: `${work.title} an der Wand`, caption: `${work.title} · An der Wand` },
      { id: 'room', image: work.room, alt: `${work.title} im Raum`, caption: `${work.title} · Im Raum` },
    ].filter(Boolean)
  }, [work])

  useEffect(() => {
    if (!work) return
    const url = toAbsoluteUrl(`/werk/${work.slug}`)
    applySeo({
      title: `${work.title} (${work.label}) – Gabriele Wenger-Scherb`,
      description: `${work.title}, ${work.technique}, ${formatDimensions(work.dimensions)}. Originalgemälde von Gabriele Wenger-Scherb, Mittelfranken. Preis und Verfügbarkeit auf Anfrage.`,
      canonicalPath: `/werk/${work.slug}`,
      keywords: `${work.title}, Gemälde kaufen, ${work.technique}, Gabriele Wenger-Scherb, Malerei Mittelfranken`,
      ogType: 'article',
      ogImage: toAbsoluteUrl((work.art || work.wall).src),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'VisualArtwork',
        name: work.title,
        url,
        image: [toAbsoluteUrl((work.art || work.wall).src), toAbsoluteUrl(work.room.src)],
        artform: 'Malerei',
        artMedium: work.technique,
        width: work.dimensions.widthCm ? { '@type': 'Distance', name: `${work.dimensions.widthCm} cm` } : undefined,
        height: work.dimensions.heightCm ? { '@type': 'Distance', name: `${work.dimensions.heightCm} cm` } : undefined,
        creator: { '@type': 'Person', name: 'Gabriele Wenger-Scherb' },
        inLanguage: 'de',
      },
    })
  }, [work])

  if (!work) return <Navigate to="/katalog" replace />

  const current = images.find((i) => i.id === view) || images[0]

  const share = async () => {
    const url = toAbsoluteUrl(`/werk/${work.slug}`)
    try {
      if (navigator.share) {
        await navigator.share({ title: `${work.title} – Gabriele Wenger-Scherb`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      /* dismissed */
    }
  }

  return (
    <article className="work">
      <nav className="work__crumbs eyebrow" aria-label="Brotkrumen">
        <Link to="/">Galerie</Link>
        <span aria-hidden="true">/</span>
        <Link to="/katalog">Werkverzeichnis</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{work.label}</span>
      </nav>

      <div className="work__grid">
        <div className="work__viewer">
          <button
            type="button"
            className={`work__stage work__stage--${current.id}`}
            onClick={() => setZoom(images.indexOf(current))}
            aria-label={`${current.alt} vergrößern`}
          >
            <img
              key={current.image.src}
              src={current.image.src}
              srcSet={current.image.srcSet}
              sizes="(max-width: 960px) 100vw, 60vw"
              width={current.image.width}
              height={current.image.height}
              alt={current.alt}
              fetchPriority="high"
            />
            <span className="work__zoom">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="9" cy="9" r="5.5" />
                <path d="M13 13l4 4M9 6.5v5M6.5 9h5" />
              </svg>
              Vergrößern
            </span>
          </button>
          <div className="work__thumbs" role="tablist" aria-label="Ansicht wählen">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                role="tab"
                aria-selected={view === img.id}
                className={`work__thumb${view === img.id ? ' is-active' : ''}`}
                onClick={() => setView(img.id)}
              >
                <img src={img.image.thumb} alt="" loading="lazy" decoding="async" />
                <span>{VIEWS.find((v) => v.id === img.id)?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="work__info">
          <p className="eyebrow eyebrow--accent" data-reveal="fade">
            {work.label} · {pad(index + 1)} von {pad(paintings.length)}
          </p>
          <h1 className={`work__title${work.untitled ? ' is-untitled' : ''}`} data-reveal="up">
            {work.title}
          </h1>
          <p className="work__artist" data-reveal="up">
            Gabriele Wenger-Scherb
          </p>

          <dl className="spec" data-reveal="up">
            <div>
              <dt>Technik</dt>
              <dd>{work.technique}</dd>
            </div>
            <div>
              <dt>Maße</dt>
              <dd>{formatDimensions(work.dimensions)}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{ORIENTATION_LABEL[work.orientation]}</dd>
            </div>
            <div>
              <dt>Preis</dt>
              <dd>Auf Anfrage</dd>
            </div>
          </dl>

          <div className="work__cta" data-reveal="up">
            <a href={workInquiry(work)} className="btn btn--accent btn--block">
              Dieses Werk anfragen
            </a>
            <button type="button" className="btn btn--ghost btn--block" onClick={share}>
              {copied ? 'Link kopiert ✓' : 'Werk teilen'}
            </button>
          </div>

          <div data-reveal="up">
            <MeasureDrawing work={work} />
          </div>
        </aside>
      </div>

      <nav className="work__pager" aria-label="Weitere Werke blättern">
        {prev && (
          <Link to={`/werk/${prev.slug}`} className="pager pager--prev">
            <img src={(prev.art || prev.wall).src} alt="" loading="lazy" />
            <span>
              <span className="eyebrow">← Vorheriges Werk</span>
              <span className="pager__title">{prev.title}</span>
            </span>
          </Link>
        )}
        {next && (
          <Link to={`/werk/${next.slug}`} className="pager pager--next">
            <span>
              <span className="eyebrow">Nächstes Werk →</span>
              <span className="pager__title">{next.title}</span>
            </span>
            <img src={(next.art || next.wall).src} alt="" loading="lazy" />
          </Link>
        )}
      </nav>

      <section className="work__more" aria-labelledby="more-title">
        <div className="work__more-head">
          <h2 id="more-title">Weitere Werke</h2>
          <Link to="/katalog" className="text-link">
            Alle Werke <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="cards" data-reveal-group>
          {more.map((w) => (
            <li key={w.id} data-reveal="up">
              <Link to={`/werk/${w.slug}`} className="card">
                <span className="card__frame card__frame--art">
                  <img src={(w.art || w.wall).src} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="card__meta">
                  <span className="card__no">{w.label}</span>
                  <span className={`card__title${w.untitled ? ' is-untitled' : ''}`}>{w.title}</span>
                  <span className="card__spec">{formatDimensions(w.dimensions)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {zoom !== null && <Lightbox items={images} index={zoom} onClose={() => setZoom(null)} onIndexChange={setZoom} />}
    </article>
  )
}

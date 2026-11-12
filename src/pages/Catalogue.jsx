import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { paintings } from '../data/paintings'
import WorkIndex from '../components/WorkIndex'
import useReveal from '../hooks/useReveal'
import { applySeo, toAbsoluteUrl } from '../utils/seo'
import { formatDimensions } from '../utils/format'

const VIEWS = [
  { id: 'art', label: 'Werk' },
  { id: 'wall', label: 'Wand' },
  { id: 'room', label: 'Raum' },
  { id: 'list', label: 'Liste' },
]

const FORMATS = [
  { id: 'alle', label: 'Alle', short: 'Alle' },
  { id: 'hoch', label: 'Hochformat', short: 'Hoch' },
  { id: 'quer', label: 'Querformat', short: 'Quer' },
  { id: 'quadrat', label: 'Quadratisch', short: 'Quadrat' },
]

const SORTS = [
  { id: 'nr', label: 'Nach Nummer' },
  { id: 'gross', label: 'Größte zuerst' },
  { id: 'klein', label: 'Kleinste zuerst' },
]

function pick(list, value, fallback) {
  return list.some((x) => x.id === value) ? value : fallback
}

export default function Catalogue() {
  const [params, setParams] = useSearchParams()
  const view = pick(VIEWS, params.get('ansicht'), 'art')
  const format = pick(FORMATS, params.get('format'), 'alle')
  const sort = pick(SORTS, params.get('sortierung'), 'nr')
  const [optionsOpen, setOptionsOpen] = useState(false)

  useEffect(() => {
    if (!optionsOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setOptionsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [optionsOpen])

  const update = (key, value, fallback) => {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const works = useMemo(() => {
    const list = paintings.filter((p) => format === 'alle' || p.orientation === format)
    if (sort === 'gross') return [...list].sort((a, b) => b.areaCm2 - a.areaCm2)
    if (sort === 'klein') return [...list].sort((a, b) => a.areaCm2 - b.areaCm2)
    return list
  }, [format, sort])

  const counts = useMemo(() => {
    const c = { alle: paintings.length }
    paintings.forEach((p) => {
      c[p.orientation] = (c[p.orientation] || 0) + 1
    })
    return c
  }, [])

  useReveal([view, format, sort])

  const techniques = useMemo(() => [...new Set(paintings.map((w) => w.technique))], [])

  useEffect(() => {
    applySeo({
      title: 'Werkverzeichnis – Alle Gemälde | Gabriele Wenger-Scherb',
      description:
        'Das Werkverzeichnis von Gabriele Wenger-Scherb: alle Gemälde mit Technik und Maßen, an der Wand und im Raum. Filtern nach Format und Größe, Anfrage direkt zum Werk.',
      canonicalPath: '/katalog',
      keywords:
        'Werkverzeichnis, Gemälde kaufen, zeitgenössische Malerei, Galerie, Gabriele Wenger-Scherb, Mittelfranken, Bayern, Kunst kaufen in Mittelfranken',
      ogType: 'website',
      ogImage: toAbsoluteUrl('/og/werkverzeichnis.jpg'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Werkverzeichnis Gabriele Wenger-Scherb',
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
          / Werkverzeichnis
        </p>
        <h1 className="catalogue__title" data-reveal="up">
          Werk<em>verzeichnis</em>
        </h1>
        <div className="catalogue__intro" data-reveal="up">
          <p className="catalogue__lede">
            Alle Gemälde mit Technik und Maßen. Wechseln Sie zwischen Werk, Wandansicht und Raumwirkung – jedes Bild
            öffnet seine eigene Seite mit Großansicht und Anfrage.
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

      <div className="filterbar">
        <div className="filterbar__formats" role="group" aria-label="Nach Format filtern">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filterbar__tab${format === f.id ? ' is-active' : ''}`}
              aria-pressed={format === f.id}
              onClick={() => update('format', f.id, 'alle')}
            >
              {f.short}
              <sup>{counts[f.id] || 0}</sup>
            </button>
          ))}
        </div>

        <div className="filterbar__inline">
          <div className="filterbar__views" role="group" aria-label="Ansicht wählen">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`filterbar__tab${view === v.id ? ' is-active' : ''}`}
                aria-pressed={view === v.id}
                onClick={() => update('ansicht', v.id, 'art')}
              >
                {v.label}
              </button>
            ))}
          </div>
          <label className="filterbar__sort">
            <span className="visually-hidden">Sortierung</span>
            <select value={sort} onChange={(e) => update('sortierung', e.target.value, 'nr')}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="filterbar__more"
          onClick={() => setOptionsOpen(true)}
          aria-haspopup="dialog"
          aria-label={`Ansicht und Sortierung (${VIEWS.find((v) => v.id === view).label}, ${SORTS.find((s) => s.id === sort).label})`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 6h9M15 6h2M3 14h2M8 14h9" />
            <circle cx="13.5" cy="6" r="1.6" />
            <circle cx="6.5" cy="14" r="1.6" />
          </svg>
          <span>{VIEWS.find((v) => v.id === view).label}</span>
        </button>
      </div>

      {optionsOpen && (
        <div className="optsheet" role="dialog" aria-modal="true" aria-labelledby="optsheet-title">
          <button type="button" className="optsheet__scrim" aria-label="Schließen" tabIndex={-1} onClick={() => setOptionsOpen(false)} />
          <div className="optsheet__panel">
            <div className="optsheet__head">
              <p id="optsheet-title" className="eyebrow">Ansicht &amp; Sortierung</p>
              <button type="button" className="optsheet__done" onClick={() => setOptionsOpen(false)}>
                Fertig
              </button>
            </div>
            <p className="optsheet__label">Ansicht</p>
            <div className="optsheet__options">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={view === v.id ? 'is-active' : ''}
                  aria-pressed={view === v.id}
                  onClick={() => update('ansicht', v.id, 'art')}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p className="optsheet__label">Sortierung</p>
            <div className="optsheet__options">
              {SORTS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={sort === o.id ? 'is-active' : ''}
                  aria-pressed={sort === o.id}
                  onClick={() => update('sortierung', o.id, 'nr')}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="visually-hidden">Werke ({works.length})</h2>

      {view === 'list' ? (
        <div className="catalogue__list">
          <WorkIndex works={works} />
        </div>
      ) : (
        <ul className={`cards cards--catalogue cards--${view}`} data-reveal-group>
          {works.map((work, i) => {
            const img = view === 'art' ? work.art || work.wall : work[view]
            return (
              <li key={`${work.id}-${view}`} data-reveal="up">
                <Link to={`/werk/${work.slug}`} className="card">
                  <span className={`card__frame card__frame--${view}`}>
                    <img
                      src={view === 'art' ? img.src : img.thumb}
                      srcSet={view === 'art' ? undefined : img.srcSet}
                      sizes="(max-width: 560px) 100vw, (max-width: 960px) 50vw, 33vw"
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
      )}

      {works.length === 0 && <p className="catalogue__empty">Keine Werke in diesem Format.</p>}

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

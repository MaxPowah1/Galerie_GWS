import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDimensions } from '../utils/format'

/**
 * All paintings hung on one virtual gallery wall at their true relative size.
 * The wall band represents BAND_CM centimetres of height; every painting is
 * scaled from its real height in cm, its width follows the photographed aspect.
 */
const BAND_CM = 186

export default function ScaleWall({ works }) {
  const scrollerRef = useRef(null)
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return undefined
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? el.scrollLeft / max : 0)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollBy = (dir) => {
    const el = scrollerRef.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  // Mouse drag-to-pan; touch uses native scrolling.
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { active: true, moved: false, x: e.clientX, left: scrollerRef.current.scrollLeft }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    scrollerRef.current.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    drag.current.active = false
  }
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  const hung = works.filter((w) => w.art && w.dimensions.heightCm)

  return (
    <div className="scalewall" style={{ '--band-cm': BAND_CM }}>
      <div
        ref={scrollerRef}
        className="scalewall__scroller"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        aria-label="Alle Werke im Größenverhältnis"
      >
        <div className="scalewall__wall">
          <div className="scalewall__ruler" aria-hidden="true">
            <span className="scalewall__ruler-bar" />
            <span className="scalewall__ruler-label">100 cm</span>
          </div>

          {hung.map((work, i) => (
            <Link
              key={work.id}
              to={`/werk/${work.slug}`}
              className="scalewall__item"
              draggable={false}
              style={{
                '--h': work.dimensions.heightCm,
                '--ar': work.art.width / work.art.height,
              }}
            >
              <img
                src={work.art.src}
                alt={`${work.title}, ${work.technique}, ${formatDimensions(work.dimensions)}`}
                width={work.art.width}
                height={work.art.height}
                loading={i < 5 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
              <span className="scalewall__label">
                <span className="scalewall__no">{work.label}</span>
                <span className={`scalewall__title${work.untitled ? ' is-untitled' : ''}`}>{work.title}</span>
                <span className="scalewall__dim">{formatDimensions(work.dimensions)}</span>
              </span>
            </Link>
          ))}

          <Link to="/katalog" className="scalewall__end" draggable={false}>
            <span>Werkverzeichnis</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="scalewall__controls">
        <p className="scalewall__hint">
          <span className="scalewall__hint-strong">Alle {hung.length} Werke im Größenverhältnis.</span> Ziehen oder wischen
          Sie durch die Hängung – ein Klick öffnet das Werk.
        </p>
        <div className="scalewall__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
        </div>
        <div className="scalewall__buttons">
          <button type="button" className="icon-btn" onClick={() => scrollBy(-1)} aria-label="Nach links">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className="icon-btn" onClick={() => scrollBy(1)} aria-label="Nach rechts">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M8 4l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

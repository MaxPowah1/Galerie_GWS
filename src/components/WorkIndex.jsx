import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDimensions } from '../utils/format'

/** Editorial index of works; on hover devices a preview follows the cursor. */
export default function WorkIndex({ works }) {
  const [hovered, setHovered] = useState(null)
  const previewRef = useRef(null)

  const move = (e) => {
    const el = previewRef.current
    if (el) el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 120}px, 0)`
  }

  return (
    <div className="windex" onMouseMove={move} onMouseLeave={() => setHovered(null)}>
      <div className="windex__head" aria-hidden="true">
        <span>Nr.</span>
        <span>Titel</span>
        <span>Technik</span>
        <span>Maße (H × B)</span>
      </div>
      <ol className="windex__list">
        {works.map((work) => (
          <li key={work.id}>
            <Link
              to={`/werk/${work.slug}`}
              className="windex__row"
              onMouseEnter={() => setHovered(work)}
              onFocus={() => setHovered(null)}
            >
              <span className="windex__no">{work.label.replace('Nr. ', '')}</span>
              <span className="windex__thumb" aria-hidden="true">
                <img src={(work.art || work.wall).src} alt="" loading="lazy" decoding="async" />
              </span>
              <span className={`windex__title${work.untitled ? ' is-untitled' : ''}`}>{work.title}</span>
              <span className="windex__tech">{work.technique}</span>
              <span className="windex__dim">{formatDimensions(work.dimensions)}</span>
              <span className="windex__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div ref={previewRef} className={`windex__preview${hovered ? ' is-on' : ''}`} aria-hidden="true">
        {hovered && <img key={hovered.id} src={hovered.room.thumb} alt="" />}
      </div>
    </div>
  )
}

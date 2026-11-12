import { useEffect, useRef, useState } from 'react'
import { pad } from '../utils/format'

/**
 * Full-screen viewer. Shows each image at up to its native resolution;
 * a click (or tap) magnifies it to 100 % pixels and the pointer pans.
 * items: [{ image: { src, width, height }, alt, caption }]
 */
export default function Lightbox({ items, index, onClose, onIndexChange }) {
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [scale, setScale] = useState(2)
  const imgRef = useRef(null)
  const closeRef = useRef(null)
  const total = items.length
  const item = items[index]
  const canNav = total > 1 && onIndexChange

  useEffect(() => {
    closeRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (canNav && e.key === 'ArrowLeft') onIndexChange((index - 1 + total) % total)
      else if (canNav && e.key === 'ArrowRight') onIndexChange((index + 1) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canNav, index, total, onClose, onIndexChange])

  const go = (step) => {
    setZoom(false)
    onIndexChange((index + step + total) % total)
  }

  const track = (clientX, clientY) => {
    const rect = imgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    setOrigin(`${x}% ${y}%`)
  }

  const toggleZoom = (e) => {
    const img = imgRef.current
    if (!img) return
    if (!zoom) {
      const native = item.image.width / img.getBoundingClientRect().width
      setScale(Math.max(1.8, native))
      track(e.clientX, e.clientY)
    }
    setZoom((z) => !z)
  }

  if (!item) return null

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={item.alt}>
      <div className="viewer__bar">
        <span className="viewer__caption">
          {total > 1 && (
            <span className="viewer__count">
              {pad(index + 1)} / {pad(total)}
            </span>
          )}
          {item.caption}
        </span>
        <span className="viewer__hint">{zoom ? 'Klicken zum Verkleinern' : 'Klicken zum Vergrößern'}</span>
        <button ref={closeRef} type="button" className="icon-btn icon-btn--light" onClick={onClose} aria-label="Schließen">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      <div
        className={`viewer__stage${zoom ? ' is-zoomed' : ''}`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onMouseMove={(e) => zoom && track(e.clientX, e.clientY)}
        onTouchMove={(e) => zoom && e.touches[0] && track(e.touches[0].clientX, e.touches[0].clientY)}
      >
        <img
          key={item.image.src}
          ref={imgRef}
          src={item.image.src}
          width={item.image.width}
          height={item.image.height}
          alt={item.alt}
          onClick={toggleZoom}
          style={{
            maxWidth: `min(100%, ${item.image.width}px)`,
            maxHeight: `min(100%, ${item.image.height}px)`,
            transform: zoom ? `scale(${scale})` : 'none',
            transformOrigin: origin,
          }}
        />
      </div>

      {canNav && (
        <>
          <button type="button" className="viewer__nav viewer__nav--prev" onClick={() => go(-1)} aria-label="Vorheriges Bild">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className="viewer__nav viewer__nav--next" onClick={() => go(1)} aria-label="Nächstes Bild">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M8 4l6 6-6 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

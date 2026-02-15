import { useEffect, useRef, useState } from 'react'
import { HeroSection, SpotlightSection, ManifestSection, ContactSection } from '../pages/Home'

const SLIDE_IDS = ['hero', 'portfolio', 'artist', 'contact']

export default function Slideshow() {
  const lockUntilRef = useRef(0)
  const touchStartYRef = useRef(null)

  const [activeIndex, setActiveIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    const hash = window.location.hash.replace('#', '')
    const idx = SLIDE_IDS.indexOf(hash)
    return idx >= 0 ? idx : 0
  })

  useEffect(() => {
    document.body.classList.add('is-slideshow')
    return () => document.body.classList.remove('is-slideshow')
  }, [])

  const slides = [
    { id: 'hero', ariaLabel: 'Einfuehrung', content: <HeroSection /> },
    { id: 'portfolio', ariaLabel: 'Galerie Fokus', content: <SpotlightSection /> },
    { id: 'artist', ariaLabel: 'Kuenstlerin', content: <ManifestSection /> },
    { id: 'contact', ariaLabel: 'Kontakt', content: <ContactSection /> },
  ]

  const clampIndex = (value) => Math.max(0, Math.min(slides.length - 1, value))

  useEffect(() => {
    const hash = `#${slides[activeIndex].id}`
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${hash}`)
    }
  }, [activeIndex, slides])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      const next = slides.findIndex((slide) => slide.id === hash)
      if (next >= 0) setActiveIndex(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [slides])

  useEffect(() => {
    const ANIMATION_MS = 950

    const canNavigate = () => Date.now() >= lockUntilRef.current
    const navigateBy = (step) => {
      if (!canNavigate()) return
      setActiveIndex((prev) => {
        const next = clampIndex(prev + step)
        if (next !== prev) lockUntilRef.current = Date.now() + ANIMATION_MS
        return next
      })
    }

    const onWheel = (event) => {
      event.preventDefault()
      if (Math.abs(event.deltaY) < 12) return
      navigateBy(event.deltaY > 0 ? 1 : -1)
    }

    const onKeyDown = (event) => {
      if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault()
        navigateBy(1)
      }
      if (['ArrowUp', 'PageUp'].includes(event.key)) {
        event.preventDefault()
        navigateBy(-1)
      }
    }

    const onTouchStart = (event) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
    }

    const SWIPE_THRESHOLD = 50

    const onTouchEnd = (event) => {
      const startY = touchStartYRef.current
      const endY = event.changedTouches[0]?.clientY
      touchStartYRef.current = null
      if (startY == null || endY == null) return
      const distance = startY - endY
      if (Math.abs(distance) < SWIPE_THRESHOLD) return
      navigateBy(distance > 0 ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [slides.length])

  return (
    <div className="slideshow" aria-live="polite">
      {slides.map((slide, index) => (
        <section
          key={slide.id}
          id={slide.id}
          className={`slide-panel slide-panel--${slide.id}${index === activeIndex ? ' slide-panel--active' : ''}`}
          style={{
            transform: `translateY(${(index - activeIndex) * 100}%)`,
            zIndex: index + 1,
          }}
          aria-label={slide.ariaLabel}
          aria-hidden={index !== activeIndex}
        >
          <div className="slide-panel__inner">{slide.content}</div>
        </section>
      ))}
    </div>
  )
}

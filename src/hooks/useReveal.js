import { useEffect } from 'react'

/**
 * Adds `is-visible` to every [data-reveal] element as it scrolls into view.
 * Siblings inside the same [data-reveal-group] are staggered.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll('[data-reveal]:not(.is-visible)'))
    items.forEach((el) => {
      const group = el.closest('[data-reveal-group]')
      if (!group) return
      const siblings = Array.from(group.querySelectorAll('[data-reveal]'))
      el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 8) * 90}ms`)
    })

    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

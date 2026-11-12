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

    const show = (el) => {
      el.classList.add('is-visible')
      observer.unobserve(el)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) show(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    items.forEach((el) => observer.observe(el))

    // Safety net: content must never stay hidden because a browser failed to
    // report an intersection. Anything whose top edge is on screen is shown.
    let pending = items
    let frame = 0
    const sweep = () => {
      frame = 0
      const limit = window.innerHeight * 0.95
      pending = pending.filter((el) => {
        if (el.classList.contains('is-visible')) return false
        if (el.getBoundingClientRect().top < limit) {
          show(el)
          return false
        }
        return true
      })
      if (!pending.length) window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sweep)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const initial = window.setTimeout(sweep, 1200)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
      window.clearTimeout(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

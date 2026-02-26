import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSplash } from '../context/SplashContext'
import artistPhoto from '../assets/Artist/Artist_foto.png'
import artistPhotoPose2 from '../assets/Artist/Artist_pose_2.png'
import { paintings } from '../data/paintings'
import { applySeo, toAbsoluteUrl } from '../utils/seo'

const EMAIL_PARTS = {
  user: [97, 110, 102, 114, 97, 103, 101], // "anfrage"
  domain: [97, 116, 101, 108, 105, 101, 114, 45, 119, 101, 110, 103, 101, 114, 115, 99, 104, 101, 114, 98], // "atelier-wengerscherb"
  tld: [99, 111, 109], // "com"
}

function buildEmailFromParts() {
  const fromCodes = (codes) => String.fromCharCode(...codes)
  const user = fromCodes(EMAIL_PARTS.user)
  const domain = fromCodes(EMAIL_PARTS.domain)
  const tld = fromCodes(EMAIL_PARTS.tld)
  return `${user}@${domain}.${tld}`
}

function wrapIndex(index, length) {
  if (length === 0) return 0
  return (index + length) % length
}

function formatDimensions(dimensions) {
  if (!dimensions) return 'Maße unbekannt'
  const { widthCm, heightCm } = dimensions
  if (!widthCm || !heightCm) return 'Maße unbekannt'
  return `${heightCm} x ${widthCm} cm`
}

export default function Home() {
  const { splashVisible, setSplashDone } = useSplash()
  const paired = paintings
  const [scrollY, setScrollY] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [showSplash, setShowSplash] = useState(splashVisible)
  const [splashClosing, setSplashClosing] = useState(false)
  const [stageView, setStageView] = useState('scenario')
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomedIndex, setZoomedIndex] = useState(null)
  const [isMobilePortfolio, setIsMobilePortfolio] = useState(false)
  const [activeLegalPopup, setActiveLegalPopup] = useState(null)
  const [footerVisible, setFooterVisible] = useState(false)
  const footerSentinelRef = useRef(null)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailHref, setEmailHref] = useState('#')

  const WERKUEBERSICHT_WALL_COUNT = 10
  const werkuebersichtWallPaintings = paired.slice(0, WERKUEBERSICHT_WALL_COUNT)
  const legalPopups = {
    imprint: {
      label: 'Impressum',
      title: 'Impressum',
      content: (
        <>
          <p>
            Angaben gemaess Paragraph 5 TMG. Bitte ergaenzen:
          </p>
          <p>
            Name / Unternehmen
            <br />
            Strasse + Hausnummer
            <br />
            PLZ + Ort
            <br />
            E-Mail: {emailAddress || 'wird bei aktivem JavaScript dynamisch eingefügt'}
          </p>
        </>
      ),
    },
    privacy: {
      label: 'Datenschutz',
      title: 'Datenschutzerklärung',
      content: (
        <>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
            wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
            werden können. Diese Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie
            erläutert auch, wie und zu welchem Zweck das geschieht.
          </p>
          <p>
            Diese Hinweise wurden nach bestem Wissen erstellt, ersetzen jedoch keine individuelle Rechtsberatung. Für eine
            rechtlich verbindliche Prüfung Ihrer konkreten Situation wenden Sie sich bitte an eine Rechtsanwältin oder einen
            Rechtsanwalt.
          </p>

          <h4>1. Verantwortliche Stelle</h4>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <p>
            Gabriele Wenger-Scherb
            <br />
            (Anschrift bitte ergänzen)
            <br />
            E-Mail: {emailAddress || 'wird bei aktivem JavaScript dynamisch eingefügt'}
          </p>

          <h4>2. Hosting und Server-Logfiles</h4>
          <p>
            Diese Website wird bei einem externen Dienstleister (Hosting-Provider) betrieben. Beim Aufruf der Website werden
            durch Ihren Browser automatisch Informationen an den Server unseres Providers übermittelt und temporär in
            sogenannten Server-Logfiles gespeichert. Dies sind insbesondere:
          </p>
          <ul>
            <li>IP-Adresse des anfragenden Endgeräts</li>
            <li>Datum und Uhrzeit des Zugriffs</li>
            <li>Name und URL der abgerufenen Datei</li>
            <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
            <li>verwendeter Browser und ggf. das Betriebssystem Ihres Endgeräts</li>
          </ul>
          <p>
            Die Verarbeitung dieser Daten erfolgt zur Sicherstellung eines reibungslosen Verbindungsaufbaus der Website,
            zur Auswertung der Systemsicherheit und -stabilität sowie zu administrativen Zwecken.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
          </p>

          <h4>3. Kontaktaufnahme per E-Mail</h4>
          <p>
            Wenn Sie uns per E-Mail kontaktieren, werden Ihre Anfrage inklusive der von Ihnen angegebenen Kontaktdaten
            (z.&nbsp;B. Name, E-Mail-Adresse, Inhalt der Nachricht) zum Zweck der Bearbeitung der Anfrage und für den Fall von
            Anschlussfragen bei uns gespeichert und verarbeitet.
          </p>
          <p>
            Rechtsgrundlage für die Verarbeitung dieser Daten ist Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der
            Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist,
            sowie im Übrigen Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bearbeitung von Anfragen).
          </p>

          <h4>4. Cookies und Tracking</h4>
          <p>
            Nach aktuellem Stand verwenden wir ausschließlich technisch notwendige Cookies bzw. vergleichbare Technologien,
            die für den Betrieb dieser Website erforderlich sind (z.&nbsp;B. für die Darstellung und Navigation).
            Es werden insbesondere keine Analyse- oder Marketing-Tools wie z.&nbsp;B. Google Analytics eingesetzt.
          </p>

          <h4>5. Weitergabe von Daten</h4>
          <p>
            Eine Übermittlung Ihrer personenbezogenen Daten an Dritte findet grundsätzlich nicht statt, es sei denn, wir sind
            gesetzlich dazu verpflichtet oder Sie haben ausdrücklich eingewilligt.
          </p>

          <h4>6. Speicherdauer</h4>
          <p>
            Personenbezogene Daten werden nur so lange gespeichert, wie es zur Erfüllung der jeweiligen Zwecke erforderlich
            ist oder wie es gesetzliche Aufbewahrungsfristen vorsehen. Server-Logfiles werden in der Regel nach einer
            angemessenen Frist automatisch gelöscht, sofern keine weitergehende Aufbewahrung aus Beweisgründen notwendig ist.
          </p>

          <h4>7. Ihre Rechte</h4>
          <p>
            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über
            Ihre bei uns gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der
            Datenverarbeitung sowie ggf. ein Recht auf Berichtigung, Löschung oder Einschränkung der Verarbeitung dieser Daten.
            Außerdem haben Sie ein Recht auf Datenübertragbarkeit.
          </p>
          <p>
            Sofern die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) oder Art. 6 Abs. 1 lit. e
            oder f DSGVO erfolgt, steht Ihnen zudem das Recht zu, aus Gründen, die sich aus Ihrer besonderen Situation
            ergeben, jederzeit Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten einzulegen.
          </p>
          <p>
            Darüber hinaus haben Sie das Recht, sich bei einer zuständigen Datenschutzaufsichtsbehörde zu beschweren, wenn
            Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.
          </p>

          <h4>8. Stand dieser Datenschutzerklärung</h4>
          <p>
            Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Februar 2026. Durch die Weiterentwicklung unserer
            Website oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann es notwendig werden, diese
            Datenschutzerklärung anzupassen.
          </p>
        </>
      ),
    },
    cookies: {
      label: 'Cookie-Hinweis',
      title: 'Cookie-Hinweis',
      content: (
        <p>
          Auf dieser Website werden derzeit keine Analyse- oder Marketing-Cookies eingesetzt. Es kommt lediglich eine
          technisch notwendige Sitzungsspeicherung (sessionStorage) zum Einsatz, um die Start-Animation („Splash Screen“)
          nur beim ersten Aufruf innerhalb einer Sitzung anzuzeigen. Diese Verarbeitung dient ausschließlich der stabilen
          und nutzerfreundlichen Darstellung der Website und erfordert nach derzeitigem Stand keine gesonderte
          Einwilligung über ein Cookie-Banner.
        </p>
      ),
    },
  }
  const activeLegalContent = activeLegalPopup ? legalPopups[activeLegalPopup] : null
  const seoKeywords =
    'zeitgenössische Malerei, figurative Kunst, expressive Landschaftsmalerei, modernes Stillleben, Gabriele Wenger-Scherb, Kunst kaufen, Mittelfranken, Bayern, Region Mittelfranken'
  const artworkListJsonLd = useMemo(
    () =>
      paired.map((work, index) => ({
        '@type': 'VisualArtwork',
        name: work.title,
        image: toAbsoluteUrl(work.wallSrc),
        artform: 'Malerei',
        artMedium: work.technique,
        width: work.dimensions?.widthCm ? `${work.dimensions.widthCm} cm` : undefined,
        height: work.dimensions?.heightCm ? `${work.dimensions.heightCm} cm` : undefined,
        description: `${work.title}, ${work.technique}, ${formatDimensions(work.dimensions)}, Preiskategorie ${work.priceCategory}.`,
        url: toAbsoluteUrl('/katalog'),
        position: index + 1,
      })),
    [paired],
  )
  const homeJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Gabriele Wenger-Scherb',
          url: toAbsoluteUrl('/'),
          inLanguage: 'de',
          areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Mittelfranken, Bayern, Deutschland',
          },
        },
        {
          '@type': 'Person',
          name: 'Gabriele Wenger-Scherb',
          jobTitle: 'Malerin',
          url: toAbsoluteUrl('/'),
          image: toAbsoluteUrl(artistPhoto),
          email: emailAddress ? `mailto:${emailAddress}` : undefined,
          address: {
            '@type': 'PostalAddress',
            addressRegion: 'Mittelfranken',
            addressCountry: 'DE',
          },
          areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Mittelfranken, Bayern, Deutschland',
          },
        },
        {
          '@type': 'CollectionPage',
          name: 'Impressionen und Werkschau',
          url: toAbsoluteUrl('/'),
          hasPart: artworkListJsonLd,
          inLanguage: 'de',
          areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Mittelfranken, Bayern, Deutschland',
          },
        },
      ],
    }),
    [artworkListJsonLd, emailAddress],
  )

  useEffect(() => {
    const address = buildEmailFromParts()
    setEmailAddress(address)
    setEmailHref(`mailto:${address}`)
  }, [])

  useEffect(() => {
    applySeo({
      title: 'Gabriele Wenger-Scherb - Zeitgenoessische Malerei',
      description:
        'Zeitgenoessische figurative und atmosphaerische Malerei von Gabriele Wenger-Scherb in Mittelfranken (Bayern). Entdecken Sie Impressionen, Werkschau und Kontakt fuer Anfragen.',
      canonicalPath: '/',
      keywords: seoKeywords,
      ogImage: toAbsoluteUrl(paired[0]?.wallSrc),
      jsonLd: homeJsonLd,
    })
  }, [homeJsonLd, paired, seoKeywords])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMediaChange = () => setReduceMotion(mediaQuery.matches)
    onMediaChange()
    mediaQuery.addEventListener('change', onMediaChange)
    return () => mediaQuery.removeEventListener('change', onMediaChange)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 680px)')
    const onMediaChange = () => setIsMobilePortfolio(mediaQuery.matches)
    onMediaChange()
    mediaQuery.addEventListener('change', onMediaChange)
    return () => mediaQuery.removeEventListener('change', onMediaChange)
  }, [])

  useEffect(() => {
    if (!splashVisible) {
      setShowSplash(false)
      setSplashClosing(false)
      return
    }
    setShowSplash(true)
    setSplashClosing(false)
  }, [splashVisible])

  useEffect(() => {
    if (!showSplash) return undefined
    const visibleDuration = 8200
    const fadeDuration = 1400
    const hideTimer = window.setTimeout(() => setSplashClosing(true), visibleDuration)
    const cleanupTimer = window.setTimeout(() => {
      setShowSplash(false)
      setSplashDone(true)
    }, visibleDuration + fadeDuration)
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(cleanupTimer)
    }
  }, [reduceMotion, showSplash, setSplashDone])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sentinel = footerSentinelRef.current
    if (!sentinel) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setFooterVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px 0px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main section, main footer'))
    const revealItems = []
    const sequenceStepMs = 220

    sections.forEach((section) => {
      const sectionItems = section.matches('[data-reveal]')
        ? [section, ...Array.from(section.querySelectorAll('[data-reveal]'))]
        : Array.from(section.querySelectorAll('[data-reveal]'))
      sectionItems.forEach((el, idx) => {
        const baseDelay = Number(el.getAttribute('data-reveal-delay')) || 0
        const sequencedDelay = baseDelay + idx * sequenceStepMs
        el.style.setProperty('--reveal-delay', `${sequencedDelay}ms`)
      })
      revealItems.push(...sectionItems)
    })

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((el) => el.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [paired.length])

  const showPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? paired.length - 1 : prev - 1))
  }, [paired.length])

  const showNext = useCallback(() => {
    setActiveIndex((prev) => (prev === paired.length - 1 ? 0 : prev + 1))
  }, [paired.length])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setZoomedIndex(null)
        setActiveLegalPopup(null)
        return
      }
      if (zoomedIndex !== null) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        showPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        showNext()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [zoomedIndex, showPrevious, showNext])

  useEffect(() => {
    if (showSplash || zoomedIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showSplash, zoomedIndex])

  useEffect(() => {
    document.body.classList.toggle('splash-active', showSplash)
    return () => {
      document.body.classList.remove('splash-active')
    }
  }, [showSplash])

  const parallax = useMemo(() => {
    if (reduceMotion) {
      return { heroHeadline: 0, heroStatement: 0 }
    }
    return {
      heroHeadline: scrollY * -0.08,
      heroStatement: scrollY * -0.04,
    }
  }, [reduceMotion, scrollY])

  const activePainting = paired[activeIndex] || null
  const orbitSlots = useMemo(() => {
    if (!paired.length) return []
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const index = wrapIndex(activeIndex + offset, paired.length)
      return {
        offset,
        index,
        work: paired[index],
      }
    })
  }, [activeIndex, paired])

  const focusPainting = (index, { scrollToPortfolio = false } = {}) => {
    setActiveIndex(index)
    if (scrollToPortfolio) {
      const stage = document.getElementById('portfolio-lab')
      if (stage) stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }

  const touchStartRef = useRef({ x: 0 })
  const SWIPE_THRESHOLD = 50

  const handleStageClick = (e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const mid = rect.width / 2
    if (x < mid) showPrevious()
    else showNext()
  }

  const handleStageTouchStart = (e) => {
    touchStartRef.current.x = e.touches[0]?.clientX ?? 0
  }

  const handleStageTouchEnd = (e) => {
    const startX = touchStartRef.current.x
    const endX = e.changedTouches[0]?.clientX ?? startX
    const diff = startX - endX
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) showNext()
      else showPrevious()
    }
  }

  const jumpToPortfolio = () => {
    const section = document.getElementById('portfolio-lab')
    if (section) section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const jumpToContact = () => {
    const section = document.getElementById('contact')
    if (section) section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  const signaturePath = 'M80 100 C 200 100, 280 40, 380 80 C 420 100, 380 140, 320 120 C 260 100, 300 60, 420 60 C 580 60, 700 80, 820 90'

  return (
    <>
      {showSplash && (
        <div className={`splash-screen${splashClosing ? ' is-leaving' : ''}`} aria-hidden="true">
          <div className="splash-screen__composition">
            <p className="splash-screen__label">Atelier</p>
            <p className="splash-screen__title">Gabriele Wenger-Scherb</p>
            <svg className="splash-screen__signature" viewBox="70 30 760 130" role="presentation" focusable="false">
              <path pathLength="2200" d={signaturePath} />
              <circle className="splash-screen__pen" r="3.6" cx="-999" cy="-999">
                <animateMotion
                  dur="6.4s"
                  begin="0.35s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.2 0.9 0.22 1"
                  keyTimes="0;1"
                  path={signaturePath}
                />
              </circle>
            </svg>
          </div>
        </div>
      )}

      <section className="hero" aria-label="Einführung">
        <div className="hero__intro" data-reveal="up">
          <p className="hero__eyebrow" style={{ transform: `translate3d(0, ${parallax.heroStatement}px, 0)` }}>
            Zeitgenössische Malerei
          </p>
          <h1 className="hero__title" style={{ transform: `translate3d(0, ${parallax.heroHeadline}px, 0)` }}>
            Gabriele Wenger-Scherb
          </h1>
          <p className="hero__tagline" style={{ transform: `translate3d(0, ${parallax.heroStatement}px, 0)` }}>
            Galerie für zeitgenössische Malerei
          </p>
          <p className="hero__statement">
            Ich male die Welt, wie sie ist – ungefiltert und voller Farbe. Vom Chaos eines Walddickichts bis zur stillen Geometrie einer Wohnwagensiedlung in der Dämmerung: Meine Kunst feiert die Texturen des modernen Lebens und lädt zum Innehalten und genauen Hinsehen ein.
          </p>
          <div className="hero__cta-group" data-reveal="up" data-reveal-delay="180">
            <button type="button" className="btn btn--dark" onClick={jumpToPortfolio}>
              Zu den Werken
            </button>
            <button type="button" className="btn btn--dark" onClick={jumpToContact}>
              Anfrage stellen
            </button>
          </div>
        </div>
        <figure className="hero__image-wrap" data-reveal="right">
          <img src={artistPhoto} alt="Gabriele Wenger-Scherb, Künstlerin" className="hero__image" />
        </figure>
      </section>

      {activePainting && (
        <section id="portfolio-lab" className="portfolio-lab">
          <div className="section-head" data-reveal="up">
            <p className="section-label">Impressionen</p>
            <h2 className="portfolio-lab__heading">Ausgewaehlte Werke</h2>
            <p className="section-note">
              {isMobilePortfolio
                ? 'Durch die Werke wischen, Details vergleichen und direkt eine Arbeit aus der Mini-Galerie unten waehlen.'
                : 'Werke durchblaettern (Bild links/rechts anklicken oder Pfeiltasten), Perspektiven wechseln und eine eigene Reihenfolge entdecken.'}
            </p>
          </div>
          <div className="portfolio-lab__layout" data-reveal="scale" data-reveal-delay="80">
            <div className="portfolio-lab__stage-wrap">
              <div className="portfolio-lab__mode" role="tablist" aria-label="Ansicht der Arbeit">
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageView === 'scenario'}
                  className={stageView === 'scenario' ? 'is-active' : ''}
                  onClick={() => setStageView('scenario')}
                >
                  Atmosphäre
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageView === 'split'}
                  className={stageView === 'split' ? 'is-active' : ''}
                  onClick={() => setStageView('split')}
                >
                  Diptychon
                </button>
              </div>

              {stageView === 'split' ? (
                <div
                  className="portfolio-lab__stage portfolio-lab__stage--split"
                  onClick={handleStageClick}
                  onTouchStart={handleStageTouchStart}
                  onTouchEnd={handleStageTouchEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      showNext()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Links: vorheriges Werk, Rechts: nächstes Werk"
                >
                  <figure className="portfolio-lab__panel">
                    <img src={activePainting.scenarioSrc} alt={`${activePainting.title} im Kontext`} />
                  </figure>
                  <figure className="portfolio-lab__panel">
                    <img src={activePainting.wallSrc} alt={`${activePainting.title} an der Wand`} />
                  </figure>
                </div>
              ) : (
                <div
                  className="portfolio-lab__stage"
                  onClick={handleStageClick}
                  onTouchStart={handleStageTouchStart}
                  onTouchEnd={handleStageTouchEnd}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      showNext()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Links: vorheriges Werk, Rechts: nächstes Werk"
                >
                  <img
                    src={activePainting.scenarioSrc}
                    alt={`${activePainting.title} im Kontext`}
                  />
                </div>
              )}
            </div>

            {isMobilePortfolio ? (
              <aside className="portfolio-lab__meta portfolio-lab__meta--mobile">
                <div className="portfolio-lab__meta-header">
                  <span className="portfolio-lab__index">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(paired.length).padStart(2, '0')}
                  </span>
                  <h3 className="portfolio-lab__title">{activePainting.title}</h3>
                </div>
                <div className="portfolio-lab__nav portfolio-lab__nav--mobile">
                  <button type="button" onClick={showPrevious} aria-label="Vorheriges Werk">
                    Vorheriges
                  </button>
                  <button type="button" onClick={showNext} aria-label="Naechstes Werk">
                    Naechstes
                  </button>
                </div>
                <p className="portfolio-lab__description">
                  {stageView === 'split'
                    ? 'Zwei Ansichten im direkten Vergleich: Umgebung und Wandwirkung auf einen Blick.'
                    : 'Das Werk im Raum: Licht, Abstand und Umgebung veraendern die Wirkung sichtbar.'}
                </p>
                <div className="portfolio-lab__mobile-strip" aria-label="Alle Werke">
                  {paired.map((work, index) => (
                    <button
                      key={work.id}
                      type="button"
                      onClick={() => focusPainting(index)}
                      className={`portfolio-lab__mobile-thumb${index === activeIndex ? ' is-active' : ''}`}
                      aria-label={`${work.title} auswaehlen`}
                    >
                      <img src={work.scenarioSrc} alt="" aria-hidden="true" loading="lazy" />
                      <span>{work.title}</span>
                    </button>
                  ))}
                </div>
              </aside>
            ) : (
              <aside className="portfolio-lab__meta">
                <div className="portfolio-lab__meta-header">
                  <span className="portfolio-lab__index">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(paired.length).padStart(2, '0')}
                  </span>
                  <h3 className="portfolio-lab__title">{activePainting.title}</h3>
                </div>

                <div className="portfolio-lab__nav">
                  <button type="button" onClick={showPrevious} aria-label="Vorheriges Werk">
                    ←
                  </button>
                  <button type="button" onClick={showNext} aria-label="Nächstes Werk">
                    →
                  </button>
                </div>

                <p className="portfolio-lab__description">
                  {stageView === 'split'
                    ? 'Zwei Realitäten zugleich: Atmosphäre im Raum und architektonische Präsenz.'
                    : 'Das Werk in seinem Kontext – Licht und Distanz prägen die Lesart.'}
                </p>

                <div className="portfolio-lab__orbit" aria-label="Benachbarte Werke">
                  {orbitSlots.map(({ offset, index, work }) => (
                    <button
                      key={`${work.id}-${offset}`}
                      type="button"
                      onClick={() => focusPainting(index)}
                      className={`orbit-node${offset === 0 ? ' is-active' : ''}`}
                      style={{ '--depth': Math.abs(offset) }}
                      aria-label={`${work.title} auswählen`}
                    >
                      <img src={work.scenarioSrc} alt="" aria-hidden="true" loading="lazy" />
                      <span>{work.title}</span>
                    </button>
                  ))}
                </div>
              </aside>
            )}
          </div>

          <div className="portfolio-lab__constellation" data-reveal="up" data-reveal-delay="120">
            <p className="portfolio-lab__constellation-title">Werkübersicht</p>
            <p className="portfolio-lab__constellation-subline">
              Eine Auswahl meiner Arbeiten. Die vollständige Werkschau finden Sie im Katalog.
            </p>
            <div className="portfolio-lab__constellation-nav-wrap">
              <div className="portfolio-lab__constellation-grid portfolio-lab__constellation-grid--12">
                {werkuebersichtWallPaintings.map((art, index) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => {
                      focusPainting(index)
                      setZoomedIndex(index)
                    }}
                    className={`constellation-card${index === activeIndex ? ' is-active' : ''}`}
                  >
                    <img src={art.wallSrc} alt={`${art.title} Vorschau`} loading="lazy" />
                    <span>{art.title}</span>
                  </button>
                ))}
                {(paired.length >= 12 ? paired.slice(10, 11) : paired.slice(-2, -1)).map((art) => (
                  <Link
                    key="catalogue"
                    to="/katalog"
                    className="constellation-card constellation-card--catalogue"
                    aria-label="Im Katalog finden Sie eine komplette Übersicht aller Bilder"
                  >
                    <span className="constellation-card__img-wrap">
                      <img src={art.wallSrc} alt={`${art.title} im Katalog`} loading="lazy" />
                      <span className="constellation-card__catalogue-overlay-bg" aria-hidden="true" />
                      <span className="constellation-card__catalogue-overlay">
                        Im Katalog finden Sie eine komplette Übersicht aller Bilder
                      </span>
                    </span>
                    <span className="constellation-card__caption">zum Katalog →</span>
                  </Link>
                ))}
                <Link
                  to="/katalog"
                  className="constellation-card constellation-card--dots"
                  aria-label="Zum Katalog"
                >
                  <span className="constellation-card__img-wrap constellation-card__img-wrap--dots">
                    <span className="constellation-card__dots">zum Katalog →</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="artist" className="artist">
        <p className="section-label" data-reveal="left">Künstlerin</p>
        <div className="artist__layout">
          <div className="artist__text" data-reveal="left">
            <h2>Ueber die Kuenstlerin</h2>
            <p>
              Meine Kunst ist eine Erkundung der Momente, die wir normalerweise übersehen – der Stapel Wäsche in der Ecke, der Blick aus einem Lastwagen auf einer einsamen Autobahn oder die stille Konzentration eines Menschen bei der Arbeit. Mich fasziniert die Schnittstelle zwischen dem Häuslichen und dem Ungezähmten. Durch kräftige Pinselstriche und eine lebendige Farbpalette übersetze ich die physische Präsenz meiner Umgebung in eine Bildsprache, die sich zugleich vertraut und surreal anfühlt.
            </p>
            <p>
              Jedes Gemälde ist das Protokoll einer bestimmten Atmosphäre. Ob es das kühle, schattige Licht einer Gasse oder die verschlungene Komplexität eines Waldbodens ist – mein Ziel ist es, das „Gefühl" eines Ortes einzufangen, nicht nur sein Abbild. Ich lade den Betrachter ein, die Schönheit im Unordentlichen, im Industriellen und im Alltäglichen zu entdecken.
            </p>
            <p>
              Geprägt von der Liebe zu expressiven Texturen und gesättigten Farben bewegt sich meine Arbeit zwischen darstellender Porträtkunst und atmosphärischer Abstraktion. Ich nutze starke Lichtkontraste und einen satten, malerischen Farbauftrag, um meinen Motiven eine spürbare Präsenz und Beständigkeit zu verleihen.
            </p>
            <p>
              Zentrale Themen meiner Arbeit sind die Schönheit des Profanen – die Transformation von Pappkartons und Haushaltsgegenständen in skulpturale Studien –, Übergangsräume wie Straßen, Gassen und die Randbereiche unseres täglichen Lebens sowie menschliche Momente: Porträts von Figuren in Augenblicken ungestellter, authentischer Reflexion.
            </p>
            <p>
              Ein Gemälde muss für mich lebendig wirken. Indem ich sichtbare Pinselstriche und eine mutige, teils unerwartete Farbenlehre betone, schaffe ich Werke, die zum Innehalten und genauen Hinsehen einladen.
            </p>
          </div>
          <div className="artist__photo-wrap" data-reveal="right" data-reveal-delay="150">
            <img
              src={artistPhotoPose2}
              alt="Gabriele Wenger-Scherb, Künstlerin"
              className="artist__photo"
            />
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <p className="section-label" data-reveal="fade">Kontakt</p>
        <div data-reveal="fade" data-reveal-delay="80">
          <h2>Anfragen & Kooperationen</h2>
          <p>
            Für Ausstellungen, Preise, Auftragsarbeiten und Studio-Anfragen freue ich mich über Ihre Nachricht.
          </p>
          <p>
            Weitere Arbeiten finden Sie im <Link to="/katalog">vollstaendigen Katalog</Link>.
          </p>
          <a
            className="btn btn--dark"
            href={emailHref}
            onClick={(e) => {
              if (!emailAddress || !emailHref || emailHref === '#') {
                e.preventDefault()
              }
            }}
          >
            {emailAddress || 'E-Mail schreiben'}
          </a>
          <span className="contact__honeypot" aria-hidden="true">
            kontakt+spamtrap@example.invalid
          </span>
        </div>
      </section>

      <div ref={footerSentinelRef} className="site-footer__sentinel" aria-hidden="true" />

      <footer
        className={`site-footer${footerVisible ? ' is-visible' : ''}`}
        aria-label="Rechtliche Informationen"
      >
        <p className="site-footer__copyright">
          © {new Date().getFullYear()} Gabriele Wenger-Scherb
        </p>
        <nav className="site-footer__links" aria-label="Rechtliche Links">
          {Object.entries(legalPopups).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className="site-footer__link"
              onClick={() => setActiveLegalPopup(key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </footer>

      {activeLegalContent && (
        <div
          className="legal-popup"
          onClick={() => setActiveLegalPopup(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveLegalPopup(null)}
          aria-label="Rechtlichen Hinweis schliessen"
        >
          <div className="legal-popup__backdrop" />
          <article
            className="legal-popup__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-popup-title"
          >
            <header className="legal-popup__header">
              <h3 id="legal-popup-title">{activeLegalContent.title}</h3>
              <button
                type="button"
                className="legal-popup__close"
                onClick={() => setActiveLegalPopup(null)}
                aria-label="Popup schliessen"
              >
                X
              </button>
            </header>
            <div className="legal-popup__content">{activeLegalContent.content}</div>
          </article>
        </div>
      )}

      {zoomedIndex !== null && paired[zoomedIndex] && (
        <div
          className="constellation-lightbox"
          onClick={() => setZoomedIndex(null)}
          onKeyDown={(e) => e.key === 'Enter' && setZoomedIndex(null)}
          role="button"
          tabIndex={0}
          aria-label="Vergrößertes Bild schließen"
        >
          <div className="constellation-lightbox__backdrop" />
          <figure
            className="constellation-lightbox__figure"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={paired[zoomedIndex].wallSrc}
              alt={`${paired[zoomedIndex].title} vergrößert`}
            />
            <figcaption>{paired[zoomedIndex].title}</figcaption>
          </figure>
        </div>
      )}
    </>
  )
}

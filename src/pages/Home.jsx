import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSplash } from '../context/SplashContext'
import artistPhoto from '../assets/Artist/Artist_foto.png?format=webp&quality=86'
import artistPhotoPose2 from '../assets/Artist/Artist_pose_2.png?format=webp&quality=86'
import { paintings } from '../data/paintings'
import { exhibitionPhotos } from '../data/exhibition'
import ScaleWall from '../components/ScaleWall'
import WorkIndex from '../components/WorkIndex'
import InquiryForm from '../components/InquiryForm'
import Lightbox from '../components/Lightbox'
import useReveal from '../hooks/useReveal'
import { applySeo, toAbsoluteUrl } from '../utils/seo'
import { buildEmail, buildMailto, workInquiry } from '../utils/email'
import { formatDimensions, isoWeek, ORIENTATION_LABEL } from '../utils/format'

const SIGNATURE_PATH =
  'M80 100 C 200 100, 280 40, 380 80 C 420 100, 380 140, 320 120 C 260 100, 300 60, 420 60 C 580 60, 700 80, 820 90'

const THEMES = [
  {
    title: 'Die Schönheit des Profanen',
    text: 'Die Transformation von Pappkartons und Haushaltsgegenständen in skulpturale Studien.',
  },
  { title: 'Übergangsräume', text: 'Straßen, Gassen und die Randbereiche unseres täglichen Lebens.' },
  {
    title: 'Menschliche Momente',
    text: 'Porträts von Figuren in Augenblicken ungestellter, authentischer Reflexion.',
  },
]

const SEO_KEYWORDS =
  'zeitgenössische Malerei, figurative Kunst, expressive Landschaftsmalerei, modernes Stillleben, Gabriele Wenger-Scherb, Kunst kaufen, Mittelfranken, Bayern, Region Mittelfranken'

function scrollToId(id) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

function Splash({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const visible = reduce ? 700 : 2600
    const t1 = window.setTimeout(() => setLeaving(true), visible)
    const t2 = window.setTimeout(onDone, visible + 800)
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [onDone])

  return (
    <div
      className={`splash${leaving ? ' is-leaving' : ''}`}
      onClick={() => {
        setLeaving(true)
        window.setTimeout(onDone, 400)
      }}
      aria-hidden="true"
    >
      <div className="splash__inner">
        <svg className="splash__signature" viewBox="70 30 760 130" role="presentation" focusable="false">
          <path pathLength="2200" d={SIGNATURE_PATH} />
        </svg>
        <p className="splash__name">Gabriele Wenger-Scherb</p>
      </div>
    </div>
  )
}

function SectionHead({ no, title, intro, invert = false }) {
  return (
    <header className={`chapter__head${invert ? ' chapter__head--invert' : ''}`} data-reveal="up">
      <span className="chapter__no">{no}</span>
      <h2 className="chapter__title">{title}</h2>
      {intro && <p className="chapter__intro">{intro}</p>}
    </header>
  )
}

export default function Home() {
  const { splashVisible, setSplashDone } = useSplash()
  const [emailAddress] = useState(buildEmail)
  const [photoIndex, setPhotoIndex] = useState(null)

  const week = isoWeek()
  const titled = paintings.filter((p) => !p.untitled)
  const featured = titled[week % titled.length]

  useReveal([splashVisible])

  const homeJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Gabriele Wenger-Scherb',
          url: toAbsoluteUrl('/'),
          inLanguage: 'de',
          areaServed: { '@type': 'AdministrativeArea', name: 'Mittelfranken, Bayern, Deutschland' },
        },
        {
          '@type': 'Person',
          name: 'Gabriele Wenger-Scherb',
          jobTitle: 'Malerin',
          url: toAbsoluteUrl('/'),
          image: toAbsoluteUrl(artistPhoto),
          email: `mailto:${emailAddress}`,
          address: { '@type': 'PostalAddress', addressRegion: 'Mittelfranken', addressCountry: 'DE' },
        },
        {
          '@type': 'CollectionPage',
          name: 'Werkverzeichnis Gabriele Wenger-Scherb',
          url: toAbsoluteUrl('/'),
          inLanguage: 'de',
          hasPart: paintings.map((work, index) => ({
            '@type': 'VisualArtwork',
            name: work.title,
            image: toAbsoluteUrl(work.wall.src),
            artform: 'Malerei',
            artMedium: work.technique,
            width: work.dimensions.widthCm ? `${work.dimensions.widthCm} cm` : undefined,
            height: work.dimensions.heightCm ? `${work.dimensions.heightCm} cm` : undefined,
            url: toAbsoluteUrl(`/werk/${work.slug}`),
            position: index + 1,
          })),
        },
      ],
    }),
    [emailAddress],
  )

  useEffect(() => {
    applySeo({
      title: 'Gabriele Wenger-Scherb – Zeitgenössische Malerei aus Mittelfranken',
      description:
        'Zeitgenössische figurative und atmosphärische Malerei von Gabriele Wenger-Scherb in Mittelfranken (Bayern). Alle Werke im Größenverhältnis, Werkverzeichnis und direkte Anfrage.',
      canonicalPath: '/',
      keywords: SEO_KEYWORDS,
      ogImage: toAbsoluteUrl(paintings[0]?.wall.src),
      jsonLd: homeJsonLd,
    })
  }, [homeJsonLd])

  const onSplashDone = useCallback(() => setSplashDone(true), [setSplashDone])
  const closePhoto = useCallback(() => setPhotoIndex(null), [])

  return (
    <>
      {splashVisible && <Splash onDone={onSplashDone} />}

      {/* ── Cover with the scale wall ─────────────────────────── */}
      <section className="cover" aria-label="Einführung">
        <div className="cover__top">
          <div className="cover__rail" data-reveal="fade">
            <span>Zeitgenössische Malerei</span>
            <span>Atelier in Arberg · Mittelfranken</span>
            <span>{paintings.length} Werke · Acryl &amp; Öl</span>
          </div>
          <h1 className="cover__title" data-reveal="up">
            Gabriele Wenger-<em>Scherb</em>
          </h1>
          <div className="cover__sub" data-reveal="up">
            <p className="cover__lede">
              Ich male die Welt, wie sie ist – ungefiltert und voller Farbe. Vom Chaos eines Walddickichts bis zur stillen
              Geometrie einer Wohnwagensiedlung in der Dämmerung.
            </p>
            <div className="cover__actions">
              <Link to="/katalog" className="btn btn--solid">
                Werkverzeichnis
              </Link>
              <button type="button" className="btn btn--ghost" onClick={() => scrollToId('contact')}>
                Anfrage stellen
              </button>
            </div>
          </div>
        </div>
        <div data-reveal="fade">
          <ScaleWall works={paintings} />
        </div>
      </section>

      {/* ── 01 Werk der Woche ─────────────────────────────────── */}
      {featured && (
        <section className="spotlight" aria-label="Werk der Woche">
          <Link to={`/werk/${featured.slug}`} className="spotlight__media" data-reveal="mask">
            <img
              src={featured.room.src}
              srcSet={featured.room.srcSet}
              sizes="(max-width: 900px) 100vw, 58vw"
              width={featured.room.width}
              height={featured.room.height}
              alt={`${featured.title} im Raum`}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <div className="spotlight__text">
            <p className="eyebrow eyebrow--accent" data-reveal="up">
              01 — Werk der Woche · KW {week}
            </p>
            <h2 className={`spotlight__title${featured.untitled ? ' is-untitled' : ''}`} data-reveal="up">
              {featured.title}
            </h2>
            <dl className="spec" data-reveal="up">
              <div>
                <dt>Werk</dt>
                <dd>{featured.label}</dd>
              </div>
              <div>
                <dt>Technik</dt>
                <dd>{featured.technique}</dd>
              </div>
              <div>
                <dt>Maße</dt>
                <dd>
                  {formatDimensions(featured.dimensions)} · {ORIENTATION_LABEL[featured.orientation]}
                </dd>
              </div>
            </dl>
            <p className="spotlight__note" data-reveal="up">
              Jede Woche rückt ein Werk aus der Sammlung in den Mittelpunkt. Preis und Verfügbarkeit erfahren Sie auf
              Anfrage.
            </p>
            <div className="spotlight__actions" data-reveal="up">
              <Link to={`/werk/${featured.slug}`} className="btn btn--solid">
                Werk ansehen
              </Link>
              <a href={workInquiry(featured)} className="text-link">
                Direkt anfragen <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── 02 Werkverzeichnis ────────────────────────────────── */}
      <section className="chapter" id="werke">
        <SectionHead
          no="02"
          title="Werkverzeichnis"
          intro="Alle Arbeiten auf einen Blick. Jedes Werk hat eine eigene Seite mit Großansicht, Raumwirkung und Anfrage."
        />
        <div data-reveal="up">
          <WorkIndex works={paintings} />
        </div>
        <div className="chapter__more" data-reveal="up">
          <Link to="/katalog" className="btn btn--solid">
            Katalog mit allen Ansichten
          </Link>
        </div>
      </section>

      {/* ── 03 Ausstellung & Atelier ──────────────────────────── */}
      <section className="chapter chapter--tint" id="ausstellung">
        <SectionHead
          no="03"
          title="Ausstellung & Atelier"
          intro="Malerei braucht Raum. Einblicke in Ausstellungen und in die Arbeit im Atelier."
        />
        <ul className="collage" data-reveal-group>
          {exhibitionPhotos.map((photo, i) => (
            <li key={photo.key} className={`collage__item collage__item--${i + 1}`} data-reveal="up">
              <button type="button" onClick={() => setPhotoIndex(i)} aria-label={`${photo.caption} vergrößern`}>
                <img
                  src={photo.thumb}
                  srcSet={photo.srcSet}
                  sizes="(max-width: 700px) 50vw, 33vw"
                  alt={photo.caption}
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <span className="collage__caption">{photo.caption}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 04 Künstlerin ─────────────────────────────────────── */}
      <section id="artist" className="chapter">
        <SectionHead no="04" title="Über die Künstlerin" />
        <div className="profile">
          <figure className="profile__photo" data-reveal="mask">
            <img src={artistPhotoPose2} alt="Gabriele Wenger-Scherb, Künstlerin" loading="lazy" decoding="async" />
          </figure>
          <div className="profile__text">
            <p className="profile__lead" data-reveal="up">
              Meine Kunst ist eine Erkundung der Momente, die wir normalerweise übersehen – der Stapel Wäsche in der Ecke,
              der Blick aus einem Lastwagen auf einer einsamen Autobahn oder die stille Konzentration eines Menschen bei
              der Arbeit.
            </p>
            <div className="profile__body" data-reveal="up">
              <p className="dropcap">
                Mich fasziniert die Schnittstelle zwischen dem Häuslichen und dem Ungezähmten. Durch kräftige
                Pinselstriche und eine lebendige Farbpalette übersetze ich die physische Präsenz meiner Umgebung in eine
                Bildsprache, die sich zugleich vertraut und surreal anfühlt.
              </p>
              <p>
                Jedes Gemälde ist das Protokoll einer bestimmten Atmosphäre. Ob es das kühle, schattige Licht einer Gasse
                oder die verschlungene Komplexität eines Waldbodens ist – mein Ziel ist es, das „Gefühl“ eines Ortes
                einzufangen, nicht nur sein Abbild. Ich lade den Betrachter ein, die Schönheit im Unordentlichen, im
                Industriellen und im Alltäglichen zu entdecken.
              </p>
              <p>
                Geprägt von der Liebe zu expressiven Texturen und gesättigten Farben bewegt sich meine Arbeit zwischen
                darstellender Porträtkunst und atmosphärischer Abstraktion. Ich nutze starke Lichtkontraste und einen
                satten, malerischen Farbauftrag, um meinen Motiven eine spürbare Präsenz und Beständigkeit zu verleihen.
              </p>
            </div>
            <div className="themes" data-reveal-group>
              <p className="eyebrow">Zentrale Themen</p>
              <ol>
                {THEMES.map((t, i) => (
                  <li key={t.title} data-reveal="up">
                    <span className="themes__no">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{t.title}</h3>
                      <p>{t.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <blockquote className="pullquote" data-reveal="up">
          <p>
            Ein Gemälde muss für mich <em>lebendig</em> wirken.
          </p>
          <footer>
            Indem ich sichtbare Pinselstriche und eine mutige, teils unerwartete Farbenlehre betone, schaffe ich Werke,
            die zum Innehalten und genauen Hinsehen einladen.
          </footer>
        </blockquote>
      </section>

      {/* ── 05 Kontakt ────────────────────────────────────────── */}
      <section id="contact" className="contact">
        <div className="contact__inner">
          <SectionHead no="05" title="Kontakt" invert />
          <div className="contact__grid">
            <div data-reveal="up">
              <p className="contact__headline">
                Anfragen <em>&amp;</em> Kooperationen
              </p>
              <p className="contact__text">
                Für Ausstellungen, Preise, Auftragsarbeiten und Studio-Anfragen freue ich mich über Ihre Nachricht.
              </p>
              <div className="contact__mail">
                <p className="eyebrow">Oder direkt per E-Mail</p>
                <a className="contact__address" href={buildMailto()}>
                  {emailAddress}
                </a>
                <p className="contact__place">Atelier in Arberg, Mittelfranken</p>
              </div>
            </div>
            <div data-reveal="up">
              <InquiryForm />
            </div>
          </div>
          <span className="contact__honeypot" aria-hidden="true">
            kontakt+spamtrap@example.invalid
          </span>
        </div>
      </section>

      {photoIndex !== null && (
        <Lightbox
          items={exhibitionPhotos.map((p) => ({ image: p.image, alt: p.caption, caption: p.caption }))}
          index={photoIndex}
          onClose={closePhoto}
          onIndexChange={setPhotoIndex}
        />
      )}
    </>
  )
}

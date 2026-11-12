/**
 * Post-build step: writes a static index.html for every route with its own
 * title, description, canonical URL, Open Graph / Twitter tags, JSON-LD and a
 * plain-HTML fallback body, and renders 1200×630 JPEG share images.
 *
 * Why: social networks (WhatsApp, Facebook, LinkedIn …) and several crawlers do
 * not run JavaScript, so without this every shared link shows the home page.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://atelier-wengerscherb.com'
const ARTIST = 'Gabriele Wenger-Scherb'
const PAPER = '#f3efe8'

const PRERENDER_CSS = [
  '.pr{font-family:"Instrument Sans",Arial,sans-serif;background:#f3efe8;color:#1b1915}',
  '.pr__hero{min-height:100vh;min-height:100svh;display:grid;place-content:center;gap:14px;padding:24px;text-align:center;box-sizing:border-box}',
  '.pr h1{margin:0;font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:clamp(2rem,6vw,3.4rem);line-height:1}',
  '.pr__hero p{margin:0 auto;max-width:34rem;color:#6b6358;font-size:.95rem;line-height:1.6}',
  '.pr__more{max-width:56rem;margin:0 auto;padding:48px 24px;font-size:.9rem;line-height:1.7}',
  '.pr a{color:inherit}',
  // Only shown if JavaScript has not taken over after 1.2 s (slow network, no JS);
  // normally React replaces it first, so visitors go straight into the intro.
  '.pr{animation:pr-in .5s ease 1.2s both}@keyframes pr-in{from{opacity:0}}',
].join('')

const details = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/paintingDetails.json'), 'utf8'))

const pad = (n) => String(n).padStart(2, '0')
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const slugify = (t) =>
  t
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const dims = (d) => (d?.widthCm && d?.heightCm ? `${d.heightCm} × ${d.widthCm} cm` : 'Maße auf Anfrage')

// Mirrors src/data/paintings.js (number 15 is excluded there as well).
const works = details
  .filter((d) => d.number !== 15)
  .sort((a, b) => a.number - b.number)
  .map((d) => {
    const title = d.title || 'Ohne Titel'
    return {
      ...d,
      title,
      label: `Nr. ${pad(d.number)}`,
      slug: `${pad(d.number)}-${slugify(d.title || 'ohne-titel')}`,
      art: path.join(ROOT, 'src/assets/artwork', `${d.number}.png`),
    }
  })

/* ---------- share images ------------------------------------------------- */

await fs.mkdir(path.join(DIST, 'og'), { recursive: true })

async function shareImage(sources, file) {
  const W = 1200
  const H = 630
  const gap = 40
  const maxH = 470
  const maxW = (W - 120 - gap * (sources.length - 1)) / sources.length
  const tiles = await Promise.all(
    sources.map((src) => sharp(src).resize({ width: Math.round(maxW), height: maxH, fit: 'inside' }).toBuffer({ resolveWithObject: true })),
  )
  const total = tiles.reduce((s, t) => s + t.info.width, 0) + gap * (tiles.length - 1)
  let x = Math.round((W - total) / 2)
  const composites = []
  for (const t of tiles) {
    const top = Math.round((H - t.info.height) / 2)
    // soft shadow so the painting reads as hung on a wall
    const shadow = await sharp({
      create: { width: t.info.width, height: t.info.height, channels: 4, background: { r: 27, g: 25, b: 21, alpha: 0.35 } },
    })
      .png()
      .toBuffer()
    composites.push({ input: await sharp(shadow).blur(14).toBuffer(), left: x + 6, top: top + 14 })
    composites.push({ input: t.data, left: x, top })
    x += t.info.width + gap
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: PAPER } })
    .composite(composites)
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(DIST, 'og', file))
  return `${SITE}/og/${file}`
}

const homeImage = await shareImage(
  [works[0], works[3], works[7]].map((w) => w.art),
  'galerie.jpg',
)
const catalogueImage = await shareImage(
  [works[2], works[5], works[8], works[1]].map((w) => w.art),
  'werkverzeichnis.jpg',
)
for (const w of works) {
  w.ogImage = await shareImage([w.art], `werk-${w.slug}.jpg`)
}

/* ---------- html per route ---------------------------------------------- */

const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8')

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function page({ route, title, description, image, type = 'website', jsonLd, body }) {
  const url = `${SITE}${route}`
  let html = template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:type', type)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'property', 'og:image', image)
  html = setMeta(html, 'property', 'og:image:width', '1200')
  html = setMeta(html, 'property', 'og:image:height', '630')
  html = setMeta(html, 'property', 'og:locale', 'de_DE')
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)
  html = setMeta(html, 'name', 'twitter:image', image)
  if (jsonLd) {
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json" id="seo-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n  </head>`,
    )
  }
  // Plain HTML for crawlers without JavaScript; React replaces it on load.
  // Styled like the splash's first frame (name centred on gallery paper) so the
  // moment before JavaScript runs looks intentional instead of a raw list.
  html = html.replace('</head>', `    <style>${PRERENDER_CSS}</style>
  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  return html
}

async function write(route, html) {
  const dir = route === '/' ? DIST : path.join(DIST, ...route.split('/').filter(Boolean))
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, 'index.html'), html)
}

const workList = works
  .map((w) => `<li><a href="/werk/${w.slug}">${esc(w.label)} – ${esc(w.title)}</a>, ${esc(w.technique)}, ${esc(dims(w.dimensions))}</li>`)
  .join('')

const person = {
  '@type': 'Person',
  name: ARTIST,
  jobTitle: 'Malerin',
  url: `${SITE}/`,
  address: { '@type': 'PostalAddress', addressLocality: 'Arberg', addressRegion: 'Mittelfranken', addressCountry: 'DE' },
}

await write(
  '/',
  page({
    route: '/',
    title: `${ARTIST} – Zeitgenössische Malerei aus Mittelfranken`,
    description:
      'Zeitgenössische figurative und atmosphärische Malerei von Gabriele Wenger-Scherb aus Arberg (Mittelfranken). Alle Werke im Größenverhältnis, Werkverzeichnis und direkte Anfrage.',
    image: homeImage,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'WebSite', name: ARTIST, url: `${SITE}/`, inLanguage: 'de' }, person],
    },
    body: `<main class="pr"><div class="pr__hero"><h1>${ARTIST}</h1><p>Zeitgenössische Malerei aus Arberg, Mittelfranken</p></div><section class="pr__more"><h2>Werkverzeichnis</h2><ul>${workList}</ul></section></main>`,
  }),
)

await write(
  '/katalog',
  page({
    route: '/katalog',
    title: `Werkverzeichnis – Alle Gemälde | ${ARTIST}`,
    description: `Alle ${works.length} Gemälde von Gabriele Wenger-Scherb mit Technik und Maßen – an der Wand und im Raum. Preis und Verfügbarkeit auf Anfrage.`,
    image: catalogueImage,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Werkverzeichnis ${ARTIST}`,
      url: `${SITE}/katalog`,
      inLanguage: 'de',
      hasPart: works.map((w) => ({ '@type': 'VisualArtwork', name: w.title, url: `${SITE}/werk/${w.slug}` })),
    },
    body: `<main class="pr"><div class="pr__hero"><h1>Werkverzeichnis</h1><p>${ARTIST} – alle ${works.length} Gemälde</p></div><section class="pr__more"><ul>${workList}</ul></section></main>`,
  }),
)

for (const w of works) {
  const name = w.title === 'Ohne Titel' ? `Ohne Titel (${w.label})` : w.title
  const description = `${name} – ${w.technique}, ${dims(w.dimensions)}. Originalgemälde von ${ARTIST}, Mittelfranken. Preis und Verfügbarkeit auf Anfrage.`
  await write(
    `/werk/${w.slug}`,
    page({
      route: `/werk/${w.slug}`,
      title: `${name} – ${ARTIST}`,
      description,
      image: w.ogImage,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'VisualArtwork',
        name,
        url: `${SITE}/werk/${w.slug}`,
        image: w.ogImage,
        artform: 'Malerei',
        artMedium: w.technique,
        width: w.dimensions?.widthCm ? { '@type': 'Distance', name: `${w.dimensions.widthCm} cm` } : undefined,
        height: w.dimensions?.heightCm ? { '@type': 'Distance', name: `${w.dimensions.heightCm} cm` } : undefined,
        creator: person,
        inLanguage: 'de',
      },
      body: `<main class="pr"><article class="pr__hero"><h1>${esc(name)}</h1><p>${esc(description)}</p><p><a href="/katalog">Zum Werkverzeichnis</a></p></article></main>`,
    }),
  )
}

/* ---------- sitemap with lastmod ---------------------------------------- */

const today = new Date().toISOString().slice(0, 10)
const urls = [
  ['/', 'weekly', '1.0'],
  ['/katalog', 'weekly', '0.9'],
  ...works.map((w) => [`/werk/${w.slug}`, 'monthly', '0.8']),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, f, p]) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${f}</changefreq>\n    <priority>${p}</priority>\n  </url>`).join('\n')}
</urlset>
`
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap)

console.log(`prerender: ${urls.length} pages, ${works.length + 2} share images`)

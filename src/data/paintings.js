import paintingDetails from './paintingDetails.json'

/*
 * Every source image is converted at build time (vite-imagetools):
 *   - `thumb`: 480 px wide WebP for grids and strips
 *   - `full`:  WebP at the file's native resolution for the stage and zoom view
 * Nothing is ever upscaled, so the zoom view shows every pixel that exists.
 */
const wallThumb = import.meta.glob('../assets/painting_on_wall/*.png', { eager: true, import: 'default', query: '?w=480&format=webp&quality=78&as=metadata' })
const wallFull = import.meta.glob('../assets/painting_on_wall/*.png', { eager: true, import: 'default', query: '?format=webp&quality=90&as=metadata' })
const roomThumb = import.meta.glob('../assets/Szenarios/*.png', { eager: true, import: 'default', query: '?w=480&format=webp&quality=78&as=metadata' })
const roomFull = import.meta.glob('../assets/Szenarios/*.png', { eager: true, import: 'default', query: '?format=webp&quality=90&as=metadata' })
// Paintings cut out of the wall photos — used for the scale wall and the catalogue.
const artFull = import.meta.glob('../assets/artwork/*.png', { eager: true, import: 'default', query: '?format=webp&quality=90&as=metadata' })

const detailsByNumber = Object.fromEntries(paintingDetails.map((d) => [d.number, d]))

function byNumber(modules) {
  const out = {}
  Object.entries(modules).forEach(([path, meta]) => {
    const n = parseInt(path.split(/[/\\]/).pop(), 10)
    if (!Number.isNaN(n)) out[n] = meta
  })
  return out
}

function image(thumb, full) {
  if (!full) return null
  const small = thumb && thumb.width < full.width ? thumb : null
  return {
    src: full.src,
    thumb: (small || full).src,
    srcSet: small ? `${small.src} ${small.width}w, ${full.src} ${full.width}w` : `${full.src} ${full.width}w`,
    width: full.width,
    height: full.height,
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function orientationOf(w, h) {
  if (!w || !h) return 'unknown'
  const r = w / h
  if (r > 1.05) return 'quer'
  if (r < 0.95) return 'hoch'
  return 'quadrat'
}

function buildPaintings() {
  const walls = byNumber(wallFull)
  const wallsT = byNumber(wallThumb)
  const rooms = byNumber(roomFull)
  const roomsT = byNumber(roomThumb)
  const arts = byNumber(artFull)

  return Object.keys(walls)
    .map(Number)
    .filter((n) => n !== 15 && rooms[n])
    .sort((a, b) => a - b)
    .map((n, index) => {
      const d = detailsByNumber[n] || {}
      const nn = String(n).padStart(2, '0')
      const untitled = !d.title
      const title = d.title || 'Ohne Titel'
      const widthCm = d.dimensions?.widthCm ?? null
      const heightCm = d.dimensions?.heightCm ?? null
      const art = arts[n] ? image(null, arts[n]) : null
      return {
        id: index + 1,
        number: n,
        label: `Nr. ${nn}`,
        slug: `${nn}-${slugify(untitled ? 'ohne-titel' : title)}`,
        untitled,
        title,
        technique: d.technique || 'Technik auf Anfrage',
        dimensions: { widthCm, heightCm },
        orientation: orientationOf(widthCm, heightCm),
        areaCm2: widthCm && heightCm ? widthCm * heightCm : 0,
        wall: image(wallsT[n], walls[n]),
        room: image(roomsT[n], rooms[n]),
        art,
        // Kept for older call sites (SEO helpers, alt texts).
        wallSrc: walls[n].src,
        scenarioSrc: rooms[n].src,
      }
    })
}

export const paintings = buildPaintings()

export function findBySlug(slug) {
  return paintings.find((p) => p.slug === slug) || null
}

import paintingDetails from './paintingDetails.json'

// Load scenario images (in-situ) and wall images (frontal on wall)
// Paths relative to this file
const szenarioModules = import.meta.glob('../assets/Szenarios/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const wallModules = import.meta.glob('../assets/painting_on_wall/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const detailsByNumber = paintingDetails.reduce((acc, detail) => {
  if (typeof detail.number === 'number') acc[detail.number] = detail
  return acc
}, {})

/** Extract numeric base name from path, e.g. "../assets/Szenarios/1.png" -> 1 */
function baseName(path) {
  const name = path.split(/[/\\]/).pop() || ''
  return name.replace(/\.[^.]+$/, '')
}

/** Build paired paintings: each entry has scenario + wall image by matching number */
function buildPaintings() {
  const byNum = (modules) => {
    const out = {}
    Object.entries(modules).forEach(([path, src]) => {
      const num = baseName(path)
      const n = parseInt(num, 10)
      if (!Number.isNaN(n)) out[n] = src
    })
    return out
  }
  const szenarios = byNum(szenarioModules)
  const walls = byNum(wallModules)
  const numbers = [...new Set([...Object.keys(szenarios).map(Number), ...Object.keys(walls).map(Number)])]
    .filter((n) => n !== 15)
    .sort((a, b) => a - b)
  return numbers
    .filter((n) => szenarios[n] && walls[n])
    .map((n, index) => {
      const details = detailsByNumber[n] || {}

      return {
        id: index + 1,
        number: n,
        scenarioSrc: szenarios[n],
        wallSrc: walls[n],
        title: details.title || `Werk ${String(n).padStart(2, '0')}`,
        displayTitle: details.title
          ? `Werk ${String(n).padStart(2, '0')} - ${details.title}`
          : `Werk ${String(n).padStart(2, '0')}`,
        priceCategory: details.priceCategory || 'TBD',
        technique: details.technique || 'Technik folgt',
        dimensions: {
          widthCm: details.dimensions?.widthCm ?? null,
          heightCm: details.dimensions?.heightCm ?? null,
        },
      }
    })
}

export const paintings = buildPaintings()

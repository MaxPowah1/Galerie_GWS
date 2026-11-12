const thumbs = import.meta.glob('../assets/exhibition/*.jpeg', {
  eager: true,
  import: 'default',
  query: '?w=720&format=webp&quality=78&as=metadata',
})
const fulls = import.meta.glob('../assets/exhibition/*.jpeg', {
  eager: true,
  import: 'default',
  query: '?format=webp&quality=88&as=metadata',
})

const CAPTIONS = {
  'ausstellung-1': 'Ausstellungsansicht',
  'ausstellung-2': 'Ausstellungsansicht',
  kuenstlerin: 'Die Künstlerin',
  'atelier-1': 'Im Atelier',
  'atelier-2': 'Im Atelier',
  'atelier-3': 'Im Atelier',
}

const ORDER = ['ausstellung-1', 'atelier-1', 'kuenstlerin', 'ausstellung-2', 'atelier-3', 'atelier-2']

export const exhibitionPhotos = ORDER.map((key) => {
  const path = `../assets/exhibition/${key}.jpeg`
  const full = fulls[path]
  const thumb = thumbs[path]
  if (!full) return null
  return {
    key,
    caption: CAPTIONS[key],
    thumb: thumb.src,
    srcSet: `${thumb.src} ${thumb.width}w, ${full.src} ${full.width}w`,
    image: { src: full.src, width: full.width, height: full.height },
  }
}).filter(Boolean)

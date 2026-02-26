const SITE_URL = 'https://atelier-wengerscherb.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`

function upsertMeta(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function upsertJsonLd(data) {
  const scriptId = 'seo-jsonld'
  let script = document.head.querySelector(`#${scriptId}`)
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = scriptId
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

export function applySeo({
  title,
  description,
  canonicalPath = '/',
  keywords = '',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`
  document.title = title
  upsertMeta('name', 'description', description)
  upsertMeta('name', 'keywords', keywords)
  upsertMeta('name', 'theme-color', '#f5f1ea')
  upsertMeta('property', 'og:site_name', 'Gabriele Wenger-Scherb')
  upsertMeta('property', 'og:type', ogType)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', canonicalUrl)
  upsertMeta('property', 'og:image', ogImage)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', ogImage)
  upsertCanonical(canonicalUrl)
  if (jsonLd) upsertJsonLd(jsonLd)
}

export function toAbsoluteUrl(path) {
  if (!path) return SITE_URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

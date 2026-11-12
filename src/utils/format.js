export function formatDimensions(dimensions) {
  const { widthCm, heightCm } = dimensions || {}
  if (!widthCm || !heightCm) return 'Maße auf Anfrage'
  return `${heightCm} × ${widthCm} cm`
}

export function pad(n) {
  return String(n).padStart(2, '0')
}

export const ORIENTATION_LABEL = {
  hoch: 'Hochformat',
  quer: 'Querformat',
  quadrat: 'Quadratisch',
  unknown: '–',
}

/** ISO calendar week — drives the "Werk der Woche" rotation. */
export function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

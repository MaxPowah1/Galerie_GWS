// The address is assembled at runtime so it never appears as plain text in the HTML source.
const EMAIL_PARTS = {
  user: [97, 110, 102, 114, 97, 103, 101],
  domain: [97, 116, 101, 108, 105, 101, 114, 45, 119, 101, 110, 103, 101, 114, 115, 99, 104, 101, 114, 98],
  tld: [99, 111, 109],
}

export function buildEmail() {
  const fromCodes = (codes) => String.fromCharCode(...codes)
  return `${fromCodes(EMAIL_PARTS.user)}@${fromCodes(EMAIL_PARTS.domain)}.${fromCodes(EMAIL_PARTS.tld)}`
}

export function buildMailto(subject, body) {
  const params = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  return `mailto:${buildEmail()}${params.length ? `?${params.join('&')}` : ''}`
}

export function workInquiry(work) {
  const name = work.untitled ? work.label : `${work.label} – ${work.title}`
  return buildMailto(
    `Anfrage zu ${name}`,
    `Guten Tag Frau Wenger-Scherb,

ich interessiere mich für das Werk „${name}“ (${work.technique}).
Bitte senden Sie mir Informationen zu Preis und Verfügbarkeit.

Mit freundlichen Grüßen
`,
  )
}

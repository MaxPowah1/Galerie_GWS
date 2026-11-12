import { useState } from 'react'
import { paintings } from '../data/paintings'
import { buildMailto } from '../utils/email'

const TOPICS = ['Kauf eines Werks', 'Preis & Verfügbarkeit', 'Auftragsarbeit', 'Ausstellung / Kooperation']

/**
 * Prepares an e-mail in the visitor's own mail program.
 * Nothing is sent through this website (static hosting, no backend).
 */
export default function InquiryForm({ defaultWork = '' }) {
  const [name, setName] = useState('')
  const [work, setWork] = useState(defaultWork)
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const chosen = paintings.find((p) => p.slug === work)
    const workLine = chosen ? `${chosen.label}${chosen.untitled ? '' : ` – ${chosen.title}`}` : ''
    const subject = workLine ? `${topic}: ${workLine}` : topic
    const body = [
      'Guten Tag Frau Wenger-Scherb,',
      '',
      workLine ? `mein Anliegen: ${topic} – ${workLine}.` : `mein Anliegen: ${topic}.`,
      message ? `\n${message}` : '',
      '',
      'Mit freundlichen Grüßen',
      name,
    ].join('\n')
    window.location.href = buildMailto(subject, body)
  }

  return (
    <form className="inquiry" onSubmit={submit}>
      <fieldset className="inquiry__topics">
        <legend>Worum geht es?</legend>
        <div className="inquiry__chips">
          {TOPICS.map((t) => (
            <label key={t} className={`chip chip--dark${topic === t ? ' is-active' : ''}`}>
              <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="inquiry__row">
        <label className="field">
          <span>Ihr Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>
        <label className="field">
          <span>Werk (optional)</span>
          <select value={work} onChange={(e) => setWork(e.target.value)}>
            <option value="">Kein bestimmtes Werk</option>
            {paintings.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label} – {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Nachricht (optional)</span>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      <div className="inquiry__foot">
        <button type="submit" className="btn btn--accent">
          Anfrage vorbereiten <span aria-hidden="true">→</span>
        </button>
        <p className="inquiry__note">
          Öffnet Ihr E-Mail-Programm mit der fertigen Nachricht. Über diese Website werden keine Daten übertragen.
        </p>
      </div>
    </form>
  )
}

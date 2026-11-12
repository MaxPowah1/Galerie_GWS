import { useEffect, useRef } from 'react'
import { buildEmail } from '../utils/email'

function getLegalContent(email) {
  return {
    imprint: {
      label: 'Impressum',
      title: 'Impressum',
      content: (
        <>
          <p>Angaben gemäß § 5 TMG:</p>
          <p>
            Gabriele Wenger-Scherb
            <br />
            Marktplatz 3
            <br />
            91722 Arberg
            <br />
            Deutschland
          </p>
          <p>
            Kontakt:
            <br />
            E-Mail: {email}
          </p>
          <p>Berufsbezeichnung: Bildende Künstlerin (freiberuflich)</p>
          <p>
            Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV:
            <br />
            Gabriele Wenger-Scherb
            <br />
            Anschrift wie oben
          </p>

          <h4>Haftung für Inhalte</h4>
          <p>
            Als Diensteanbieterin bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich jedoch nicht verpflichtet, übermittelte oder gespeicherte
            fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
            hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
            Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werde ich diese Inhalte umgehend
            entfernen.
          </p>

          <h4>Haftung für Links</h4>
          <p>
            Mein Angebot kann Links zu externen Websites Dritter enthalten, auf deren Inhalte ich keinen Einfluss habe. Deshalb
            kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets die
            jeweilige Anbieterin oder der jeweilige Betreiber verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der
            Verlinkung nicht erkennbar.
          </p>
          <p>
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
            Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend
            entfernen.
          </p>

          <h4>Urheberrecht</h4>
          <p>
            Die durch die Seitenbetreiberin erstellten Inhalte und Werke auf diesen Seiten (insbesondere alle Bilder,
            Fotografien und Texte) unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
            jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung der
            jeweiligen Urheberin. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
            gestattet, sofern nicht ausdrücklich anders gekennzeichnet.
          </p>
          <p>
            Soweit die Inhalte auf dieser Seite nicht von der Betreiberin selbst erstellt wurden, werden die Urheberrechte
            Dritter beachtet und entsprechende Inhalte als solche gekennzeichnet. Sollten Sie trotzdem auf eine
            Urheberrechtsverletzung aufmerksam werden, bitte ich um einen entsprechenden Hinweis. Bei Bekanntwerden von
            Rechtsverletzungen werde ich derartige Inhalte umgehend entfernen.
          </p>

          <h4>Online-Streitbeilegung und Verbraucherschlichtung</h4>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>
            .
          </p>
          <p>
            Ich bin weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
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
            Marktplatz 3
            <br />
            91722 Arberg
            <br />
            Deutschland
            <br />
            E-Mail: {email}
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
}

export default function LegalDialog({ which, onClose }) {
  const closeRef = useRef(null)
  const content = getLegalContent(buildEmail())[which]

  useEffect(() => {
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!content) return null

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button type="button" className="sheet__scrim" aria-label="Schließen" tabIndex={-1} onClick={onClose} />
      <article className="sheet__panel">
        <header className="sheet__header">
          <h2 id="sheet-title">{content.title}</h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Schließen">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </header>
        <div className="sheet__body prose">{content.content}</div>
      </article>
    </div>
  )
}

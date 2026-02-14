import { paintings } from '../data/paintings'

export function CatalogueSection() {
  return (
    <section className="catalogue" aria-label="Werke im Ueberblick">
      <div className="catalogue__head">
        <p className="label">Katalog</p>
        <h2>Werke im Ueberblick</h2>
      </div>
      <ul className="catalogue__grid" aria-label="Werkliste">
        {paintings.map((work) => (
          <li key={work.id}>
            <article className="catalogue__card">
              <a href="/#portfolio" className="catalogue__card-link">
                <div className="catalogue__card-image-wrap">
                  <img
                    src={work.scenarioSrc}
                    alt={work.title}
                    className="catalogue__card-image"
                  />
                </div>
                <p className="catalogue__card-title">{work.title}</p>
                <span className="catalogue__card-cta">Zur Galerie</span>
              </a>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Catalogue() {
  return <CatalogueSection />
}

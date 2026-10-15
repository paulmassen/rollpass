import { m } from '../messages'

export function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <header className="faq-header">
        <h2 id="faq-title">{m.faq.title}</h2>
        <p>{m.faq.subtitle}</p>
      </header>
      <div className="faq-list">
        {m.faq.items.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <div className="faq-answer">
              {item.a.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

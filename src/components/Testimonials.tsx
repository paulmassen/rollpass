import { m } from '../messages'

export function Testimonials() {
  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <h2 id="testimonials-title">{m.testimonials.title}</h2>
      <div className="testimonial-grid">
        {m.testimonials.items.map((item, i) => (
          <figure
            key={item.quote}
            className={`testimonial${i === 0 ? ' is-feature' : ''}`}
          >
            <blockquote>
              <p>{item.quote}</p>
            </blockquote>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="testimonials-footnote">{m.testimonials.footnote}</p>
    </section>
  )
}

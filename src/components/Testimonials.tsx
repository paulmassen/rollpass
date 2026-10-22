import { m } from '../messages'

type TestimonialItem = (typeof m.testimonials.items)[number]

function Attribution({ item }: { item: TestimonialItem }) {
  return (
    <figcaption>
      <strong>{item.name}</strong>
      <span>{item.role}</span>
    </figcaption>
  )
}

export function HeroTestimonial() {
  const item = m.testimonials.items[0]

  return (
    <figure className="hero-testimonial">
      <blockquote>
        <p>{item.quote}</p>
      </blockquote>
      <Attribution item={item} />
    </figure>
  )
}

export function Testimonials() {
  return (
    <section className="testimonials" aria-labelledby="testimonials-title">
      <h2 id="testimonials-title">{m.testimonials.title}</h2>
      <div className="testimonial-grid">
        {m.testimonials.items.slice(1).map((item) => (
          <figure key={item.quote} className="testimonial">
            <blockquote>
              <p>{item.quote}</p>
            </blockquote>
            <Attribution item={item} />
          </figure>
        ))}
      </div>
    </section>
  )
}

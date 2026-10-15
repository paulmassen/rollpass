import { m } from '../messages'

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' } as const

export function Footer() {
  const { footer } = m
  const { github, linkedin, source } = footer.links

  return (
    <footer className="footer">
      <div className="support">
        <p>{footer.supportPitch}</p>
        <div className="support-buttons">
          {footer.sponsors.map((sponsor) => (
            <a
              key={sponsor.url}
              className="btn-sponsor"
              href={sponsor.url}
              {...EXTERNAL}
            >
              <span aria-hidden="true">♥</span> {sponsor.label}
            </a>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          {footer.madeBy} <strong>{footer.author}</strong>
          <span className="footer-sep" aria-hidden="true">
            {' · '}
          </span>
          <span className="footer-tagline">{footer.tagline}</span>
        </p>
        <nav className="footer-links" aria-label="Author and project links">
          {[github, linkedin, source].map((link) => (
            <a key={link.url} href={link.url} {...EXTERNAL}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

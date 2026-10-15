import { m } from '../messages'
import type { TypedKey } from '../lib/types'

type Props = {
  password: string
  keys: TypedKey[]
  onCopy: () => void
  copied: boolean
  highlightIndex: number | null
}

export function PasswordDisplay({
  password,
  keys,
  onCopy,
  copied,
  highlightIndex,
}: Props) {
  if (!password) {
    return (
      <div className="password-display is-empty">
        <p className="password-empty">{m.password.empty}</p>
      </div>
    )
  }

  return (
    <div className="password-display">
      <div className="password-row" aria-live="polite">
        <p className="password-chars">
          {keys.map((k, i) => (
            <span
              key={`${k.char}-${i}`}
              className={[
                'pwd-char',
                `hand-${k.hand}`,
                highlightIndex === i ? 'is-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ animationDelay: `${i * 28}ms` }}
              title={m.password.keyTitle(k.hand, m.fingers[k.finger], k.shifted)}
            >
              {k.char}
            </span>
          ))}
        </p>
        <button
          type="button"
          className={`btn-copy ${copied ? 'is-copied' : ''}`}
          onClick={onCopy}
          aria-label={m.password.copyAria}
        >
          {copied ? m.password.copied : m.password.copy}
        </button>
      </div>
    </div>
  )
}

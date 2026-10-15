import { m } from '../messages'
import type { GenerationResult } from '../lib/types'

type Props = {
  result: GenerationResult | null
  length: number
}

type Strength = 'weak' | 'fair' | 'good' | 'strong'

function strengthOf(bits: number): Strength {
  if (bits < 40) return 'weak'
  if (bits < 60) return 'fair'
  if (bits < 80) return 'good'
  return 'strong'
}

// The gauge is full at 100 bits and above.
const GAUGE_MAX_BITS = 100

export function SecurityPanel({ result, length }: Props) {
  if (!result) return null

  const bits = result.entropyBits
  const strength = strengthOf(bits)
  const randomBits = Math.round(length * Math.log2(Math.max(2, result.poolSize)))
  const fill = Math.min(100, Math.round((bits / GAUGE_MAX_BITS) * 100))

  return (
    <div className="security-panel">
      <div className="score-header">
        <h2>{m.security.title}</h2>
        <span className={`strength-badge is-${strength}`}>
          {m.security.strength[strength]}
        </span>
      </div>
      <p className="entropy-line">
        {m.security.entropyLabel}{' '}
        <strong>
          ≈ {Math.round(bits)} {m.security.bits}
        </strong>
      </p>
      <div
        className={`bar entropy-bar is-${strength}`}
        role="meter"
        aria-label={m.security.entropyLabel}
        aria-valuemin={0}
        aria-valuemax={GAUGE_MAX_BITS}
        aria-valuenow={Math.min(GAUGE_MAX_BITS, Math.round(bits))}
      >
        <i style={{ width: `${fill}%` }} />
      </div>
      <p className="security-note">
        {m.security.comparison(randomBits)} {m.security.estimateNote}
      </p>
      <p className="security-warning">{m.security.warning}</p>
    </div>
  )
}

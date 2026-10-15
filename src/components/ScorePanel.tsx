import { m } from '../messages'
import type { GenerationResult } from '../lib/types'

type Props = {
  result: GenerationResult | null
  playing: boolean
  onReplay: () => void
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}

export function ScorePanel({ result, playing, onReplay }: Props) {
  if (!result) return null

  return (
    <div className="score-panel">
      <div className="score-header">
        <h2>{m.score.title}</h2>
        <button
          type="button"
          className="btn-ghost"
          onClick={onReplay}
          disabled={playing}
        >
          {playing ? m.score.playing : m.score.replay}
        </button>
      </div>
      <ul className="score-list">
        <li>
          <span>{m.score.rhythm}</span>
          <strong>{pct(result.score.alternation)}</strong>
          <div className="bar">
            <i style={{ width: pct(result.score.alternation) }} />
          </div>
        </li>
        <li>
          <span>{m.score.unique}</span>
          <strong>{pct(result.score.uniqueness)}</strong>
          <div className="bar">
            <i style={{ width: pct(result.score.uniqueness) }} />
          </div>
        </li>
        <li>
          <span>{m.score.comfort}</span>
          <strong>{pct(result.score.comfort)}</strong>
          <div className="bar">
            <i style={{ width: pct(result.score.comfort) }} />
          </div>
        </li>
      </ul>
      <p className="score-overall">
        {m.score.overall} <em>{pct(result.score.overall)}</em>
      </p>
    </div>
  )
}

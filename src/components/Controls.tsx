import { m } from '../messages'
import { LAYOUT_NAMES, layoutSupportsDigits } from '../lib/layouts'
import type {
  CharsetOptions,
  HandMode,
  LayoutId,
  RowScope,
} from '../lib/types'

type Props = {
  layout: LayoutId
  handMode: HandMode
  rowScope: RowScope
  length: number
  maxLength: number
  charset: CharsetOptions
  onLayout: (v: LayoutId) => void
  onHandMode: (v: HandMode) => void
  onRowScope: (v: RowScope) => void
  onLength: (v: number) => void
  onCharset: (v: CharsetOptions) => void
  onGenerate: () => void
}

const LAYOUTS: LayoutId[] = ['qwerty', 'azerty', 'qwertz', 'dvorak']
const HANDS: HandMode[] = ['both', 'left', 'right']
const ROW_SCOPES: RowScope[] = [
  'home-top',
  'home-bottom',
  'top-bottom',
  'all',
]

export function Controls({
  layout,
  handMode,
  rowScope,
  length,
  maxLength,
  charset,
  onLayout,
  onHandMode,
  onRowScope,
  onLength,
  onCharset,
  onGenerate,
}: Props) {
  const digitsAvailable = layoutSupportsDigits(layout)
  const digitsOutOfReach =
    charset.digits && digitsAvailable && rowScope !== 'all'

  return (
    <div className="controls">
      <fieldset className="control-block">
        <legend>{m.controls.layout}</legend>
        <div className="segmented layout-grid" role="group" aria-label={m.controls.layoutAria}>
          {LAYOUTS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={layout === id}
              className={layout === id ? 'is-selected' : ''}
              onClick={() => onLayout(id)}
            >
              <span className="seg-title">{LAYOUT_NAMES[id]}</span>
              <span className="seg-hint">{m.controls.layoutRegions[id]}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="control-block">
        <legend>{m.controls.handMode}</legend>
        <div className="segmented hand-grid" role="group" aria-label={m.controls.handMode}>
          {HANDS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={handMode === id}
              className={handMode === id ? 'is-selected' : ''}
              onClick={() => onHandMode(id)}
            >
              <span className="seg-title">{m.controls.hands[id].label}</span>
              <span className="seg-hint">{m.controls.hands[id].hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="control-block">
        <legend>{m.controls.rows}</legend>
        <div className="segmented hand-grid" role="group" aria-label={m.controls.rowsAria}>
          {ROW_SCOPES.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={rowScope === id}
              className={rowScope === id ? 'is-selected' : ''}
              onClick={() => onRowScope(id)}
            >
              <span className="seg-title">{m.controls.rowScopes[id].label}</span>
              <span className="seg-hint">{m.controls.rowScopes[id].hint}</span>
            </button>
          ))}
        </div>
        {handMode !== 'both' && (
          <p className="control-hint">{m.controls.pivotNote}</p>
        )}
        {digitsOutOfReach && (
          <p className="control-hint">{m.controls.digitsOutOfReach}</p>
        )}
      </fieldset>

      <fieldset className="control-block">
        <legend>
          {m.controls.length} <span className="legend-value">{length}</span>
        </legend>
        <input
          type="range"
          min={6}
          max={Math.max(6, maxLength)}
          value={Math.min(length, maxLength)}
          onChange={(e) => onLength(Number(e.target.value))}
          aria-valuemin={6}
          aria-valuemax={maxLength}
          aria-valuenow={length}
        />
        <div className="range-meta">
          <span>6</span>
          <span>{m.controls.max} {maxLength}</span>
        </div>
      </fieldset>

      <fieldset className="control-block">
        <legend>{m.controls.charset}</legend>
        <div className="charset">
          {(
            [
              ['lowercase', 'a–z'],
              ['uppercase', 'A–Z'],
              ['digits', '0–9'],
              ['symbols', layout === 'azerty' ? ',' : '#$%'],
            ] as const
          ).map(([key, label]) => {
            const unavailable = key === 'digits' && !digitsAvailable
            return (
              <label
                key={key}
                className={`check${unavailable ? ' is-disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={charset[key] && !unavailable}
                  disabled={unavailable}
                  onChange={(e) =>
                    onCharset({ ...charset, [key]: e.target.checked })
                  }
                />
                <span>{label}</span>
              </label>
            )
          })}
        </div>
        {!digitsAvailable && (
          <p className="control-hint">{m.controls.digitsNeedShift}</p>
        )}
        {layout === 'azerty' && (
          <p className="control-hint">{m.controls.azertySymbols}</p>
        )}
      </fieldset>

      <button type="button" className="btn-generate" onClick={onGenerate}>
        {m.controls.generate}
      </button>
    </div>
  )
}

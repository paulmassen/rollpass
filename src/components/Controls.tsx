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
type Row = 'number' | 'top' | 'home' | 'bottom'
const ROWS: Row[] = ['number', 'top', 'home', 'bottom']
const SCOPE_ROWS: Record<RowScope, Row[]> = {
  all: ROWS,
  number: ['number'], top: ['top'], home: ['home'], bottom: ['bottom'],
  'number-top': ['number', 'top'], 'number-home': ['number', 'home'],
  'number-bottom': ['number', 'bottom'], 'home-top': ['top', 'home'],
  'home-bottom': ['home', 'bottom'], 'top-bottom': ['top', 'bottom'],
  'number-top-home': ['number', 'top', 'home'],
  'number-top-bottom': ['number', 'top', 'bottom'],
  'number-home-bottom': ['number', 'home', 'bottom'],
  'top-home-bottom': ['top', 'home', 'bottom'],
}

function scopeForRows(rows: Row[]): RowScope {
  return (Object.keys(SCOPE_ROWS) as RowScope[]).find((scope) =>
    SCOPE_ROWS[scope].length === rows.length && rows.every((row) => SCOPE_ROWS[scope].includes(row)),
  )!
}

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
  const selectedRows = SCOPE_ROWS[rowScope]
  const digitsOutOfReach =
    charset.digits && digitsAvailable && !selectedRows.includes('number')

  function toggleRow(row: Row) {
    const next = selectedRows.includes(row)
      ? selectedRows.filter((selected) => selected !== row)
      : [...selectedRows, row]
    if (next.length > 0) onRowScope(scopeForRows(next))
  }

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
        <p className="seg-current" aria-hidden="true">
          {m.controls.layoutRegions[layout]}
        </p>
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
        <p className="seg-current" aria-hidden="true">
          {m.controls.hands[handMode].hint}
        </p>
      </fieldset>

      <fieldset className="control-block">
        <legend>{m.controls.rows}</legend>
        <div className="segmented rows-grid" role="group" aria-label={m.controls.rowsAria}>
          {ROWS.map((row) => (
            <button
              key={row}
              type="button"
              aria-pressed={selectedRows.includes(row)}
              aria-disabled={selectedRows.length === 1 && selectedRows.includes(row)}
              className={selectedRows.includes(row) ? 'is-selected' : ''}
              onClick={() => toggleRow(row)}
            >
              <span className="seg-title">{m.controls.rowLabels[row]}</span>
            </button>
          ))}
        </div>
        <p className="seg-current">{m.controls.rowsHint}</p>
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
          value={Math.max(6, Math.min(length, maxLength))}
          disabled={maxLength < 6}
          onChange={(e) => onLength(Number(e.target.value))}
          aria-label={m.controls.lengthAria}
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
              ['symbols', layout === 'azerty' ? '&é,;!' : '#$%'],
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

      <div className="generate-dock">
        {maxLength < 6 && <p className="control-hint">Enable more keys or character types to generate a password.</p>}
        <button type="button" className="btn-generate" onClick={onGenerate} disabled={maxLength < 6}>
          {m.controls.generate}
        </button>
      </div>
    </div>
  )
}

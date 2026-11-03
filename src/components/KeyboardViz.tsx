import { m } from '../messages'
import { LAYOUT_NAMES, getLayoutKeys } from '../lib/layouts'
import { rowsForScope } from '../lib/generator'
import type { HandMode, LayoutId, RowScope, TypedKey } from '../lib/types'

type Props = {
  layout: LayoutId
  handMode: HandMode
  rowScope: RowScope
  path: TypedKey[]
  activeIndex: number | null
  excludedKeyIds: string[]
  onToggleKey: (id: string) => void
}

const ROW_OFFSETS = [0, 0.55, 0.85, 1.35]

export function KeyboardViz({
  layout,
  handMode,
  rowScope,
  path,
  activeIndex,
  excludedKeyIds,
  onToggleKey,
}: Props) {
  const keys = getLayoutKeys(layout)
  const allowedRows = rowsForScope(rowScope)
  const pathIds = new Set(path.map((k) => k.keyId))
  const activeKeyId =
    activeIndex != null && path[activeIndex] ? path[activeIndex].keyId : null
  // A key can come back several times (the index finger in one-hand mode)
  const order = new Map<string, number[]>()
  path.forEach((k, i) => {
    order.set(k.keyId, [...(order.get(k.keyId) ?? []), i + 1])
  })

  const rows = [0, 1, 2, 3]
  // The visual path (numbers on keys, colors) is invisible to screen readers:
  // spell it out as "1 n, right index; 2 k, right middle; ...".
  const pathLabel = path
    .map((k, i) => `${i + 1} ${k.char}, ${m.fingers[k.finger].toLowerCase()}`)
    .join('; ')

  return (
    <div className="keyboard" role="group" aria-label={m.password.keyboardAria(LAYOUT_NAMES[layout], pathLabel)} aria-describedby="keyboard-hint">
      <p className="keyboard-hint" id="keyboard-hint">{m.password.keyboardHint}</p>
      {rows.map((row) => {
        const rowKeys = keys.filter((k) => k.row === row)
        const rowOff = allowedRows != null && !allowedRows.includes(row)
        return (
          <div
            key={row}
            className="keyboard-row"
            style={{ paddingLeft: `${ROW_OFFSETS[row]}rem` }}
          >
            {rowKeys.map((k) => {
              const handDimmed =
                handMode !== 'both' &&
                ((handMode === 'left' && k.hand === 'right') ||
                  (handMode === 'right' && k.hand === 'left'))
              const dimmed = handDimmed || rowOff
              const excluded = excludedKeyIds.includes(k.id)
              const inPath = pathIds.has(k.id)
              const isActive = activeKeyId === k.id
              const steps = order.get(k.id)

              return (
                <button
                  type="button"
                  key={k.id}
                  aria-label={m.password.keySelectionAria(k.base, m.fingers[k.finger], dimmed)}
                  aria-pressed={!excluded}
                  onClick={() => onToggleKey(k.id)}
                  className={[
                    'key',
                    `finger-${k.finger}`,
                    `hand-${k.hand}`,
                    dimmed ? 'is-dimmed' : '',
                    excluded ? 'is-excluded' : '',
                    inPath ? 'is-path' : '',
                    isActive ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-key={k.id}
                >
                  <span className="key-label">{k.base}</span>
                  {steps && (
                    <span className="key-step" title={steps.join(', ')}>
                      {steps.length > 3
                        ? `${steps.slice(0, 3).join('·')}…`
                        : steps.join('·')}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

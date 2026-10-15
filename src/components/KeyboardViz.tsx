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
}

const ROW_OFFSETS = [0, 0.55, 0.85, 1.35]

export function KeyboardViz({
  layout,
  handMode,
  rowScope,
  path,
  activeIndex,
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

  return (
    <div className="keyboard" role="img" aria-label={m.password.keyboardAria(LAYOUT_NAMES[layout])}>
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
              // One hand: the index finger always serves the bottom row (pivot)
              const isPivotKey =
                handMode !== 'both' && k.row === 3 && k.finger.endsWith('I')
              const dimmed = handDimmed || (rowOff && !isPivotKey)
              const inPath = pathIds.has(k.id)
              const isActive = activeKeyId === k.id
              const steps = order.get(k.id)

              return (
                <div
                  key={k.id}
                  className={[
                    'key',
                    `finger-${k.finger}`,
                    `hand-${k.hand}`,
                    dimmed ? 'is-dimmed' : '',
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
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

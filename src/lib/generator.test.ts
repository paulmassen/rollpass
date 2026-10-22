import { describe, expect, it } from 'vitest'
import { isDeadKeyChar, isLetter } from './layouts'
import {
  GeneratorError,
  estimateMaxLength,
  generatePassword,
  rowsForScope,
} from './generator'
import type {
  CharsetOptions,
  GeneratorOptions,
  HandMode,
  LayoutId,
  RowScope,
} from './types'

const LAYOUTS: LayoutId[] = ['qwerty', 'azerty', 'qwertz', 'dvorak']
const HANDS: HandMode[] = ['both', 'left', 'right']
const LETTERS: CharsetOptions = {
  lowercase: true,
  uppercase: true,
  digits: false,
  symbols: false,
}

function options(overrides: Partial<GeneratorOptions> = {}): GeneratorOptions {
  return {
    layout: 'qwerty',
    handMode: 'both',
    length: 12,
    charset: LETTERS,
    rowScope: 'home-top',
    ...overrides,
  }
}

describe('generatePassword', () => {
  it.each(LAYOUTS.flatMap((l) => HANDS.map((h) => [l, h] as const)))(
    '%s / %s: exact length (and unique keys with two hands)',
    (layout, handMode) => {
      for (let i = 0; i < 30; i++) {
        const length = Math.min(
          10,
          estimateMaxLength(layout, handMode, LETTERS, 'home-top'),
        )
        const r = generatePassword(options({ layout, handMode, length }))
        expect(r.password).toHaveLength(length)
        expect(r.keys).toHaveLength(length)
        if (handMode === 'both') {
          // One hand: the index is deliberately reused (see "pivot")
          expect(new Set(r.password).size).toBe(length)
          expect(new Set(r.keys.map((k) => k.keyId)).size).toBe(length)
        }
        expect(r.keys.map((k) => k.char).join('')).toBe(r.password)
      }
    },
  )

  it.each(['left', 'right'] as const)(
    '%s-hand mode: only uses that hand',
    (hand) => {
      for (let i = 0; i < 30; i++) {
        const r = generatePassword(
          options({ handMode: hand, length: 8, rowScope: 'all' }),
        )
        expect(r.keys.every((k) => k.hand === hand)).toBe(true)
      }
    },
  )

  it.each(['home-top', 'home-bottom', 'top-bottom'] as const)(
    'respects the %s row restriction',
    (rowScope: RowScope) => {
      const allowed = rowsForScope(rowScope)!
      for (let i = 0; i < 30; i++) {
        const r = generatePassword(options({ rowScope, length: 10 }))
        expect(r.keys.every((k) => allowed.includes(k.row))).toBe(true)
      }
    },
  )

  it('respects the character set', () => {
    for (let i = 0; i < 30; i++) {
      const lower = generatePassword(
        options({
          charset: { ...LETTERS, uppercase: false },
          rowScope: 'all',
        }),
      )
      expect(lower.password).toMatch(/^[a-z]+$/)

      const digits = generatePassword(
        options({
          charset: { lowercase: false, uppercase: false, digits: true, symbols: false },
          rowScope: 'all',
          length: 8,
        }),
      )
      expect(digits.password).toMatch(/^[0-9]+$/)

      const mixed = generatePassword(
        options({
          charset: { lowercase: true, uppercase: false, digits: false, symbols: true },
          rowScope: 'all',
        }),
      )
      expect(mixed.password).not.toMatch(/[A-Z0-9]/)
    }
  })

  it('with two hands, hands almost always alternate', () => {
    let transitions = 0
    let alternating = 0
    for (let i = 0; i < 40; i++) {
      const r = generatePassword(options({ length: 12 }))
      for (let j = 1; j < r.keys.length; j++) {
        transitions++
        if (r.keys[j].hand !== r.keys[j - 1].hand) alternating++
      }
    }
    expect(alternating / transitions).toBeGreaterThan(0.9)
  })

  it('never chains the same finger twice', () => {
    for (let i = 0; i < 40; i++) {
      for (const handMode of HANDS) {
        const r = generatePassword(options({ handMode, length: 8, rowScope: 'all' }))
        for (let j = 1; j < r.keys.length; j++) {
          expect(r.keys[j].finger).not.toBe(r.keys[j - 1].finger)
        }
      }
    }
  })

  it('throws GeneratorError if the length exceeds the number of keys', () => {
    const max = estimateMaxLength('qwerty', 'left', LETTERS, 'home-top')
    expect(max).toBeGreaterThan(0)
    expect(() =>
      generatePassword(options({ handMode: 'left', length: max + 1 })),
    ).toThrowError(GeneratorError)
    try {
      generatePassword(options({ handMode: 'left', length: max + 1 }))
    } catch (e) {
      expect((e as GeneratorError).code).toBe('not-enough-keys')
      expect((e as GeneratorError).available).toBe(max)
    }
  })

  it('an empty character set falls back to lowercase', () => {
    const r = generatePassword(
      options({
        charset: { lowercase: false, uppercase: false, digits: false, symbols: false },
      }),
    )
    expect(r.password).toMatch(/^[a-z]+$/)
  })

  it('generates different passwords', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(generatePassword(options()).password)
    expect(seen.size).toBeGreaterThan(45)
  })
})

describe('entropie', () => {
  it('is finite, positive and bounded by the uniform case', () => {
    for (const layout of LAYOUTS) {
      for (const handMode of HANDS) {
        const r = generatePassword(options({ layout, handMode, length: 8, rowScope: 'all' }))
        expect(Number.isFinite(r.entropyBits)).toBe(true)
        expect(r.entropyBits).toBeGreaterThanOrEqual(0)
        // Never more than independent draws over the whole pool
        expect(r.entropyBits).toBeLessThanOrEqual(8 * Math.log2(r.poolSize) + 4)
      }
    }
  })

  it('increases with length', () => {
    const avg = (length: number) => {
      let sum = 0
      for (let i = 0; i < 30; i++) sum += generatePassword(options({ length })).entropyBits
      return sum / 30
    }
    expect(avg(14)).toBeGreaterThan(avg(8))
  })
})

describe('index pivot mode (one hand)', () => {
  const HAND_MODES = ['left', 'right'] as const

  const run = (
    handMode: 'left' | 'right',
    overrides: Partial<GeneratorOptions> = {},
  ) => generatePassword(options({ handMode, length: 13, ...overrides }))

  it.each(LAYOUTS.flatMap((l) => HAND_MODES.map((h) => [l, h] as const)))(
    '%s / %s: index on the bottom row every other stroke, other fingers in between',
    (layout, hand) => {
      for (let i = 0; i < 40; i++) {
        const r = run(hand, { layout })
        r.keys.forEach((k, j) => {
          if (j % 2 === 0) {
            expect(k.finger).toBe(hand === 'left' ? 'LI' : 'RI')
            expect(k.row).toBe(3)
          } else {
            expect(['LI', 'RI']).not.toContain(k.finger)
          }
        })
      }
    },
  )

  it('each cycle of three strokes uses ring, middle and pinky', () => {
    for (let i = 0; i < 60; i++) {
      const r = run('left', { length: 14 })
      const partners = r.keys.filter((_, j) => j % 2 === 1).map((k) => k.finger)
      for (let c = 0; c + 3 <= partners.length; c += 3) {
        expect(new Set(partners.slice(c, c + 3)).size).toBe(3)
      }
    }
  })

  it('does not replay the same finger across a cycle boundary', () => {
    for (let i = 0; i < 60; i++) {
      const partners = run('right', { length: 20 }).keys
        .filter((_, j) => j % 2 === 1)
        .map((k) => k.finger)
      for (let j = 1; j < partners.length; j++) {
        expect(partners[j]).not.toBe(partners[j - 1])
      }
    }
  })

  it('never chains the same key or the same finger twice', () => {
    for (let i = 0; i < 60; i++) {
      const r = run('left', { length: 24, rowScope: 'all' })
      for (let j = 1; j < r.keys.length; j++) {
        expect(r.keys[j].keyId).not.toBe(r.keys[j - 1].keyId)
        expect(r.keys[j].finger).not.toBe(r.keys[j - 1].finger)
      }
    }
  })

  it('the other fingers respect the row restriction', () => {
    const allowed = rowsForScope('home-top')!
    for (let i = 0; i < 40; i++) {
      const r = run('right', { rowScope: 'home-top' })
      r.keys.forEach((k, j) => {
        if (j % 2 === 1) expect(allowed).toContain(k.row)
      })
    }
  })

  it('reuses index keys but favours varied characters', () => {
    const r = run('left', { length: 14 })
    const pivots = r.keys.filter((_, j) => j % 2 === 0)
    expect(pivots.length).toBeGreaterThan(new Set(pivots.map((k) => k.char)).size)
    // The other fingers repeat nothing as long as free characters remain
    const partners = r.keys.filter((_, j) => j % 2 === 1).map((k) => k.char)
    expect(new Set(partners).size).toBe(partners.length)
  })

  it('score de rythme maximal', () => {
    expect(run('left').score.alternation).toBe(1)
  })

  it('accepts up to the announced maximum length, not beyond', () => {
    const max = estimateMaxLength('qwerty', 'left', LETTERS, 'home-top')
    expect(max).toBeGreaterThanOrEqual(20)
    expect(run('left', { length: max }).password).toHaveLength(max)
    expect(() => run('left', { length: max + 1 })).toThrowError(GeneratorError)
  })

  it('falls back to the legacy generator if the index has no key (digits only)', () => {
    const r = run('left', {
      length: 5,
      rowScope: 'all',
      charset: { lowercase: false, uppercase: false, digits: true, symbols: false },
    })
    expect(r.password).toMatch(/^[0-9]{5}$/)
    expect(new Set(r.password).size).toBe(5)
  })

  it('generates varied passwords', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 50; i++) seen.add(run('left').password)
    expect(seen.size).toBeGreaterThan(48)
  })
})

describe('characters that are awkward to type', () => {
  const EVERYTHING: CharsetOptions = {
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  }

  it('AZERTY never needs Shift for anything but capital letters', () => {
    for (const handMode of HANDS) {
      for (let i = 0; i < 60; i++) {
        const r = generatePassword(
          options({
            layout: 'azerty',
            handMode,
            charset: EVERYTHING,
            rowScope: 'all',
            length: 12,
          }),
        )
        for (const k of r.keys) {
          if (k.shifted) expect(isLetter(k.char)).toBe(true)
          if (!isLetter(k.char)) expect(k.char).toBe(',')
        }
      }
    }
  })

  it.each(['azerty', 'qwertz'] as const)(
    '%s never uses a dead key',
    (layout) => {
      for (const handMode of HANDS) {
        for (let i = 0; i < 60; i++) {
          const r = generatePassword(
            options({
              layout,
              handMode,
              charset: EVERYTHING,
              rowScope: 'all',
              length: 12,
            }),
          )
          for (const ch of r.password) {
            expect(isDeadKeyChar(layout, ch)).toBe(false)
          }
        }
      }
    },
  )

  it('letters-only passwords are plain ASCII on every layout', () => {
    for (const layout of LAYOUTS) {
      for (const handMode of HANDS) {
        for (let i = 0; i < 20; i++) {
          const r = generatePassword(
            options({ layout, handMode, rowScope: 'all', length: 10 }),
          )
          expect(r.password).toMatch(/^[A-Za-z]+$/)
        }
      }
    }
  })

  it('AZERTY uses comma as its only symbol', () => {
    let seenComma = false
    for (let i = 0; i < 200; i++) {
      const r = generatePassword(
        options({
          layout: 'azerty',
          charset: { lowercase: true, uppercase: false, digits: false, symbols: true },
          rowScope: 'all',
          length: 12,
        }),
      )
      for (const char of r.password) {
        if (!isLetter(char)) expect(char).toBe(',')
        if (char === ',') seenComma = true
      }
    }
    expect(seenComma).toBe(true)
  })

  it('digits-only on AZERTY falls back to lowercase letters', () => {
    const r = generatePassword(
      options({
        layout: 'azerty',
        charset: { lowercase: false, uppercase: false, digits: true, symbols: false },
        rowScope: 'all',
      }),
    )
    expect(r.password).toMatch(/^[a-z]+$/)
  })

  it('digits still work without Shift on QWERTY', () => {
    const r = generatePassword(
      options({
        layout: 'qwerty',
        charset: { lowercase: false, uppercase: false, digits: true, symbols: false },
        rowScope: 'all',
        length: 8,
      }),
    )
    expect(r.password).toMatch(/^[0-9]{8}$/)
  })
})

describe('index pivot reaches both bottom-row keys', () => {
  it.each([
    ['left', ['v', 'b']],
    ['right', ['n', 'm']],
  ] as const)('%s hand uses %j', (hand, expected) => {
    const seen = new Set<string>()
    for (let i = 0; i < 80; i++) {
      const r = generatePassword(
        options({ handMode: hand, length: 13, rowScope: 'home-top' }),
      )
      r.keys.forEach((k, j) => {
        if (j % 2 === 0) seen.add(k.keyId)
      })
    }
    for (const id of expected) expect(seen).toContain(id)
  })
})

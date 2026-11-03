import { describe, expect, it } from 'vitest'
import { detectKeyboard, fallbackLayout, identifyLayout } from './keyboardDetection'

const map = (values: Record<string, string>) => new Map(Object.entries(values))

describe('keyboard detection', () => {
  it.each([
    ['azerty', ['a', 'z', 'q', 'y', 'w']],
    ['qwertz', ['q', 'w', 'a', 'z', 'y']],
    ['qwerty', ['q', 'w', 'a', 'y', 'z']],
    ['dvorak', ["'", ',', 'a', 'f', ';']],
  ] as const)('recognizes %s', (expected, values) => {
    expect(identifyLayout(new Map(['KeyQ', 'KeyW', 'KeyA', 'KeyY', 'KeyZ'].map((key, i) => [key, values[i]])))).toBe(expected)
  })

  it('recognizes the French Mac number-row fingerprint', () => {
    expect(identifyLayout(map({ KeyQ: 'a', KeyW: 'z', KeyA: 'q', KeyY: 'y', KeyZ: 'w', Digit6: '§', Digit8: '!' }))).toBe('azerty-mac')
  })

  it('does not guess from incomplete or unknown maps', () => {
    expect(identifyLayout(map({ KeyQ: 'q' }))).toBeNull()
    expect(identifyLayout(map({ KeyQ: 'x', KeyW: 'y', KeyA: 'z', KeyY: 'q', KeyZ: 'a' }))).toBeNull()
  })

  it('maps only single printable values to physical ids', async () => {
    const values = map({ KeyQ: 'q', KeyW: 'w', KeyA: 'a', KeyY: 'y', KeyZ: 'z', Digit1: '1', BracketLeft: 'Dead', KeyE: ' ' })
    const detected = await detectKeyboard({ getLayoutMap: async () => values })
    expect(detected?.baseKeys.get('1')).toBe('1')
    expect(detected?.baseKeys.has('lbracket')).toBe(false)
    expect(detected?.baseKeys.has('e')).toBe(false)
  })

  it('falls back on unavailable or rejected API', async () => {
    expect(await detectKeyboard()).toBeNull()
    expect(await detectKeyboard({ getLayoutMap: async () => { throw new Error('denied') } })).toBeNull()
    expect(fallbackLayout('fr-FR')).toBe('azerty')
    expect(fallbackLayout('fr-FR', 'MacIntel')).toBe('azerty-mac')
    expect(fallbackLayout('de-DE')).toBe('qwertz')
    expect(fallbackLayout('en-US')).toBe('qwerty')
  })
})

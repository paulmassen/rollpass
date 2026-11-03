import type { LayoutId } from './types'

/** The API exposes unmodified key values, not Shift/AltGr layers or dead-key behavior. */
type KeyboardApi = { getLayoutMap: () => Promise<{ get: (code: string) => string | undefined }> }

const PHYSICAL_CODES: Record<string, string> = {
  grave: 'Backquote', minus: 'Minus', equal: 'Equal',
  lbracket: 'BracketLeft', rbracket: 'BracketRight', semicolon: 'Semicolon',
  quote: 'Quote', comma: 'Comma', period: 'Period', slash: 'Slash',
  ...Object.fromEntries('1234567890'.split('').map((digit) => [digit, `Digit${digit}`])),
  ...Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => [letter, `Key${letter.toUpperCase()}`])),
}

export type DetectedKeyboard = { layout: LayoutId; baseKeys: ReadonlyMap<string, string> }

/** Only recognize distinctive complete fingerprints; unknown layouts are not guessed. */
export function identifyLayout(map: { get: (code: string) => string | undefined }): LayoutId | null {
  const fingerprint = ['KeyQ', 'KeyW', 'KeyA', 'KeyY', 'KeyZ'].map((key) => map.get(key)?.toLowerCase()).join('|')
  switch (fingerprint) {
    case 'a|z|q|y|w': return map.get('Digit8') === '!' && map.get('Digit6') === '§' ? 'azerty-mac' : 'azerty'
    case 'q|w|a|z|y': return 'qwertz'
    case "'|,|a|f|;": return 'dvorak'
    case 'q|w|a|y|z': return 'qwerty'
    default: return null
  }
}

export async function detectKeyboard(keyboard?: KeyboardApi): Promise<DetectedKeyboard | null> {
  if (!keyboard?.getLayoutMap) return null
  try {
    const map = await keyboard.getLayoutMap()
    const layout = identifyLayout(map)
    if (!layout) return null
    const baseKeys = new Map<string, string>()
    for (const [id, code] of Object.entries(PHYSICAL_CODES)) {
      const value = map.get(code)
      // Exclude named keys, dead keys, whitespace and multi-code-point strings.
      if (value && [...value].length === 1 && !/\s/u.test(value)) baseKeys.set(id, value)
    }
    return { layout, baseKeys }
  } catch {
    return null
  }
}

export function fallbackLayout(language: string, platform = ''): LayoutId {
  const lang = language.toLowerCase()
  if (lang.startsWith('fr') && /mac/i.test(platform)) return 'azerty-mac'
  if (lang.startsWith('fr') || lang.startsWith('be')) return 'azerty'
  if (lang.startsWith('de') || lang.startsWith('at') || lang.startsWith('ch')) return 'qwertz'
  return 'qwerty'
}

export function browserKeyboard(): KeyboardApi | undefined {
  return (navigator as Navigator & { keyboard?: KeyboardApi }).keyboard
}

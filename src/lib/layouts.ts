import type { Finger, Hand, KeyDef, LayoutId } from './types'

/** Physical skeleton: finger/hand/position are layout-independent. */
type PhysicalKey = {
  id: string
  row: number
  col: number
  finger: Finger
  hand: Hand
}

const PHYSICAL: PhysicalKey[] = [
  // Number row
  { id: 'grave', row: 0, col: 0, finger: 'LP', hand: 'left' },
  { id: '1', row: 0, col: 1, finger: 'LP', hand: 'left' },
  { id: '2', row: 0, col: 2, finger: 'LR', hand: 'left' },
  { id: '3', row: 0, col: 3, finger: 'LM', hand: 'left' },
  { id: '4', row: 0, col: 4, finger: 'LI', hand: 'left' },
  { id: '5', row: 0, col: 5, finger: 'LI', hand: 'left' },
  { id: '6', row: 0, col: 6, finger: 'RI', hand: 'right' },
  { id: '7', row: 0, col: 7, finger: 'RI', hand: 'right' },
  { id: '8', row: 0, col: 8, finger: 'RM', hand: 'right' },
  { id: '9', row: 0, col: 9, finger: 'RR', hand: 'right' },
  { id: '0', row: 0, col: 10, finger: 'RP', hand: 'right' },
  { id: 'minus', row: 0, col: 11, finger: 'RP', hand: 'right' },
  { id: 'equal', row: 0, col: 12, finger: 'RP', hand: 'right' },

  // Top letter row
  { id: 'q', row: 1, col: 0, finger: 'LP', hand: 'left' },
  { id: 'w', row: 1, col: 1, finger: 'LR', hand: 'left' },
  { id: 'e', row: 1, col: 2, finger: 'LM', hand: 'left' },
  { id: 'r', row: 1, col: 3, finger: 'LI', hand: 'left' },
  { id: 't', row: 1, col: 4, finger: 'LI', hand: 'left' },
  { id: 'y', row: 1, col: 5, finger: 'RI', hand: 'right' },
  { id: 'u', row: 1, col: 6, finger: 'RI', hand: 'right' },
  { id: 'i', row: 1, col: 7, finger: 'RM', hand: 'right' },
  { id: 'o', row: 1, col: 8, finger: 'RR', hand: 'right' },
  { id: 'p', row: 1, col: 9, finger: 'RP', hand: 'right' },
  { id: 'lbracket', row: 1, col: 10, finger: 'RP', hand: 'right' },
  { id: 'rbracket', row: 1, col: 11, finger: 'RP', hand: 'right' },

  // Home row
  { id: 'a', row: 2, col: 0, finger: 'LP', hand: 'left' },
  { id: 's', row: 2, col: 1, finger: 'LR', hand: 'left' },
  { id: 'd', row: 2, col: 2, finger: 'LM', hand: 'left' },
  { id: 'f', row: 2, col: 3, finger: 'LI', hand: 'left' },
  { id: 'g', row: 2, col: 4, finger: 'LI', hand: 'left' },
  { id: 'h', row: 2, col: 5, finger: 'RI', hand: 'right' },
  { id: 'j', row: 2, col: 6, finger: 'RI', hand: 'right' },
  { id: 'k', row: 2, col: 7, finger: 'RM', hand: 'right' },
  { id: 'l', row: 2, col: 8, finger: 'RR', hand: 'right' },
  { id: 'semicolon', row: 2, col: 9, finger: 'RP', hand: 'right' },
  { id: 'quote', row: 2, col: 10, finger: 'RP', hand: 'right' },

  // Bottom row
  { id: 'z', row: 3, col: 0, finger: 'LP', hand: 'left' },
  { id: 'x', row: 3, col: 1, finger: 'LR', hand: 'left' },
  { id: 'c', row: 3, col: 2, finger: 'LM', hand: 'left' },
  { id: 'v', row: 3, col: 3, finger: 'LI', hand: 'left' },
  { id: 'b', row: 3, col: 4, finger: 'LI', hand: 'left' },
  { id: 'n', row: 3, col: 5, finger: 'RI', hand: 'right' },
  { id: 'm', row: 3, col: 6, finger: 'RI', hand: 'right' },
  { id: 'comma', row: 3, col: 7, finger: 'RM', hand: 'right' },
  { id: 'period', row: 3, col: 8, finger: 'RR', hand: 'right' },
  { id: 'slash', row: 3, col: 9, finger: 'RP', hand: 'right' },
]

type CharPair = { base: string; shift: string }

/** Characters mapped onto the physical skeleton, keyed by physical id. */
const LAYOUT_CHARS: Record<LayoutId, Record<string, CharPair>> = {
  qwerty: {
    grave: { base: '`', shift: '~' },
    '1': { base: '1', shift: '!' },
    '2': { base: '2', shift: '@' },
    '3': { base: '3', shift: '#' },
    '4': { base: '4', shift: '$' },
    '5': { base: '5', shift: '%' },
    '6': { base: '6', shift: '^' },
    '7': { base: '7', shift: '&' },
    '8': { base: '8', shift: '*' },
    '9': { base: '9', shift: '(' },
    '0': { base: '0', shift: ')' },
    minus: { base: '-', shift: '_' },
    equal: { base: '=', shift: '+' },
    q: { base: 'q', shift: 'Q' },
    w: { base: 'w', shift: 'W' },
    e: { base: 'e', shift: 'E' },
    r: { base: 'r', shift: 'R' },
    t: { base: 't', shift: 'T' },
    y: { base: 'y', shift: 'Y' },
    u: { base: 'u', shift: 'U' },
    i: { base: 'i', shift: 'I' },
    o: { base: 'o', shift: 'O' },
    p: { base: 'p', shift: 'P' },
    lbracket: { base: '[', shift: '{' },
    rbracket: { base: ']', shift: '}' },
    a: { base: 'a', shift: 'A' },
    s: { base: 's', shift: 'S' },
    d: { base: 'd', shift: 'D' },
    f: { base: 'f', shift: 'F' },
    g: { base: 'g', shift: 'G' },
    h: { base: 'h', shift: 'H' },
    j: { base: 'j', shift: 'J' },
    k: { base: 'k', shift: 'K' },
    l: { base: 'l', shift: 'L' },
    semicolon: { base: ';', shift: ':' },
    quote: { base: "'", shift: '"' },
    z: { base: 'z', shift: 'Z' },
    x: { base: 'x', shift: 'X' },
    c: { base: 'c', shift: 'C' },
    v: { base: 'v', shift: 'V' },
    b: { base: 'b', shift: 'B' },
    n: { base: 'n', shift: 'N' },
    m: { base: 'm', shift: 'M' },
    comma: { base: ',', shift: '<' },
    period: { base: '.', shift: '>' },
    slash: { base: '/', shift: '?' },
  },
  azerty: {
    grave: { base: '²', shift: '²' },
    '1': { base: '&', shift: '1' },
    '2': { base: 'é', shift: '2' },
    '3': { base: '"', shift: '3' },
    '4': { base: "'", shift: '4' },
    '5': { base: '(', shift: '5' },
    '6': { base: '-', shift: '6' },
    '7': { base: 'è', shift: '7' },
    '8': { base: '_', shift: '8' },
    '9': { base: 'ç', shift: '9' },
    '0': { base: 'à', shift: '0' },
    minus: { base: ')', shift: '°' },
    equal: { base: '=', shift: '+' },
    q: { base: 'a', shift: 'A' },
    w: { base: 'z', shift: 'Z' },
    e: { base: 'e', shift: 'E' },
    r: { base: 'r', shift: 'R' },
    t: { base: 't', shift: 'T' },
    y: { base: 'y', shift: 'Y' },
    u: { base: 'u', shift: 'U' },
    i: { base: 'i', shift: 'I' },
    o: { base: 'o', shift: 'O' },
    p: { base: 'p', shift: 'P' },
    lbracket: { base: '^', shift: '¨' },
    rbracket: { base: '$', shift: '£' },
    a: { base: 'q', shift: 'Q' },
    s: { base: 's', shift: 'S' },
    d: { base: 'd', shift: 'D' },
    f: { base: 'f', shift: 'F' },
    g: { base: 'g', shift: 'G' },
    h: { base: 'h', shift: 'H' },
    j: { base: 'j', shift: 'J' },
    k: { base: 'k', shift: 'K' },
    l: { base: 'l', shift: 'L' },
    semicolon: { base: 'm', shift: 'M' },
    quote: { base: 'ù', shift: '%' },
    z: { base: 'w', shift: 'W' },
    x: { base: 'x', shift: 'X' },
    c: { base: 'c', shift: 'C' },
    v: { base: 'v', shift: 'V' },
    b: { base: 'b', shift: 'B' },
    n: { base: 'n', shift: 'N' },
    m: { base: ',', shift: '?' },
    comma: { base: ';', shift: '.' },
    period: { base: ':', shift: '/' },
    slash: { base: '!', shift: '§' },
  },
  qwertz: {
    grave: { base: '^', shift: '°' },
    '1': { base: '1', shift: '!' },
    '2': { base: '2', shift: '"' },
    '3': { base: '3', shift: '§' },
    '4': { base: '4', shift: '$' },
    '5': { base: '5', shift: '%' },
    '6': { base: '6', shift: '&' },
    '7': { base: '7', shift: '/' },
    '8': { base: '8', shift: '(' },
    '9': { base: '9', shift: ')' },
    '0': { base: '0', shift: '=' },
    minus: { base: 'ß', shift: '?' },
    equal: { base: '´', shift: '`' },
    q: { base: 'q', shift: 'Q' },
    w: { base: 'w', shift: 'W' },
    e: { base: 'e', shift: 'E' },
    r: { base: 'r', shift: 'R' },
    t: { base: 't', shift: 'T' },
    y: { base: 'z', shift: 'Z' },
    u: { base: 'u', shift: 'U' },
    i: { base: 'i', shift: 'I' },
    o: { base: 'o', shift: 'O' },
    p: { base: 'p', shift: 'P' },
    lbracket: { base: 'ü', shift: 'Ü' },
    rbracket: { base: '+', shift: '*' },
    a: { base: 'a', shift: 'A' },
    s: { base: 's', shift: 'S' },
    d: { base: 'd', shift: 'D' },
    f: { base: 'f', shift: 'F' },
    g: { base: 'g', shift: 'G' },
    h: { base: 'h', shift: 'H' },
    j: { base: 'j', shift: 'J' },
    k: { base: 'k', shift: 'K' },
    l: { base: 'l', shift: 'L' },
    semicolon: { base: 'ö', shift: 'Ö' },
    quote: { base: 'ä', shift: 'Ä' },
    z: { base: 'y', shift: 'Y' },
    x: { base: 'x', shift: 'X' },
    c: { base: 'c', shift: 'C' },
    v: { base: 'v', shift: 'V' },
    b: { base: 'b', shift: 'B' },
    n: { base: 'n', shift: 'N' },
    m: { base: 'm', shift: 'M' },
    comma: { base: ',', shift: ';' },
    period: { base: '.', shift: ':' },
    slash: { base: '-', shift: '_' },
  },
  dvorak: {
    grave: { base: '`', shift: '~' },
    '1': { base: '1', shift: '!' },
    '2': { base: '2', shift: '@' },
    '3': { base: '3', shift: '#' },
    '4': { base: '4', shift: '$' },
    '5': { base: '5', shift: '%' },
    '6': { base: '6', shift: '^' },
    '7': { base: '7', shift: '&' },
    '8': { base: '8', shift: '*' },
    '9': { base: '9', shift: '(' },
    '0': { base: '0', shift: ')' },
    minus: { base: '[', shift: '{' },
    equal: { base: ']', shift: '}' },
    q: { base: "'", shift: '"' },
    w: { base: ',', shift: '<' },
    e: { base: '.', shift: '>' },
    r: { base: 'p', shift: 'P' },
    t: { base: 'y', shift: 'Y' },
    y: { base: 'f', shift: 'F' },
    u: { base: 'g', shift: 'G' },
    i: { base: 'c', shift: 'C' },
    o: { base: 'r', shift: 'R' },
    p: { base: 'l', shift: 'L' },
    lbracket: { base: '/', shift: '?' },
    rbracket: { base: '=', shift: '+' },
    a: { base: 'a', shift: 'A' },
    s: { base: 'o', shift: 'O' },
    d: { base: 'e', shift: 'E' },
    f: { base: 'u', shift: 'U' },
    g: { base: 'i', shift: 'I' },
    h: { base: 'd', shift: 'D' },
    j: { base: 'h', shift: 'H' },
    k: { base: 't', shift: 'T' },
    l: { base: 'n', shift: 'N' },
    semicolon: { base: 's', shift: 'S' },
    quote: { base: '-', shift: '_' },
    z: { base: ';', shift: ':' },
    x: { base: 'q', shift: 'Q' },
    c: { base: 'j', shift: 'J' },
    v: { base: 'k', shift: 'K' },
    b: { base: 'x', shift: 'X' },
    n: { base: 'b', shift: 'B' },
    m: { base: 'm', shift: 'M' },
    comma: { base: 'w', shift: 'W' },
    period: { base: 'v', shift: 'V' },
    slash: { base: 'z', shift: 'Z' },
  },
}

export const LAYOUT_NAMES: Record<LayoutId, string> = {
  qwerty: 'QWERTY',
  azerty: 'AZERTY',
  qwertz: 'QWERTZ',
  dvorak: 'Dvorak',
}

const cache = new Map<LayoutId, KeyDef[]>()

export function getLayoutKeys(layout: LayoutId): KeyDef[] {
  const hit = cache.get(layout)
  if (hit) return hit

  const chars = LAYOUT_CHARS[layout]
  const keys = PHYSICAL.map((p) => {
    const pair = chars[p.id]
    if (!pair) {
      throw new Error(`Missing char mapping for ${layout}/${p.id}`)
    }
    return {
      ...p,
      base: pair.base,
      shift: pair.shift,
    }
  })

  cache.set(layout, keys)
  return keys
}

/** Finger order left → right for roll scoring. */
export const FINGER_ORDER: Finger[] = [
  'LP',
  'LR',
  'LM',
  'LI',
  'RI',
  'RM',
  'RR',
  'RP',
]

export function fingerIndex(finger: Finger): number {
  return FINGER_ORDER.indexOf(finger)
}

/**
 * Plain ASCII letters only. Accented letters (é, ü, ß…) are deliberately
 * classified as symbols: they are not what "a–z" means, and many sites and
 * foreign keyboards choke on them.
 */
export function isLetter(char: string): boolean {
  return /^[a-zA-Z]$/.test(char)
}

export function isDigit(char: string): boolean {
  return /^[0-9]$/.test(char)
}

export function isSymbol(char: string): boolean {
  return !isLetter(char) && !isDigit(char) && char.length === 1
}

/**
 * Characters that are dead keys on their layout: pressing them prints nothing
 * until the next key is typed (then `^` + `e` gives `ê`), so they can't be part
 * of a password typed key by key.
 */
const DEAD_KEY_CHARS: Partial<Record<LayoutId, string>> = {
  azerty: '^¨',
  qwertz: '^´`',
}

export function isDeadKeyChar(layout: LayoutId, char: string): boolean {
  return DEAD_KEY_CHARS[layout]?.includes(char) ?? false
}

/**
 * AZERTY puts digits and most punctuation (? . / § % ° + £) behind Shift.
 * Those are avoided there: only letters may use Shift (capitals).
 */
const AVOIDS_SHIFTED_SPECIALS: ReadonlySet<LayoutId> = new Set(['azerty'])

export function avoidsShiftedSpecials(layout: LayoutId): boolean {
  return AVOIDS_SHIFTED_SPECIALS.has(layout)
}

/**
 * On AZERTY, the comma is the only symbol worth using: it is directly under
 * the right index finger. Every other symbol is either a stretch, a dead key,
 * or needs Shift.
 */
export function isComfortableSymbol(layout: LayoutId, char: string): boolean {
  return layout !== 'azerty' || char === ','
}

/** Whether digits can be typed without Shift on this layout (false on AZERTY). */
export function layoutSupportsDigits(layout: LayoutId): boolean {
  return !avoidsShiftedSpecials(layout) || getLayoutKeys(layout).some((k) => isDigit(k.base))
}

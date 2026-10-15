import {
  getLayoutKeys,
  isDigit,
  isLetter,
  isSymbol,
} from './layouts'
import { randomFloat, shuffle } from './random'
import type {
  CharsetOptions,
  Finger,
  GenerationResult,
  GeneratorOptions,
  Hand,
  HandMode,
  KeyDef,
  RowScope,
  TypedKey,
} from './types'

/** Physical rows allowed for a given scope. */
export function rowsForScope(scope: RowScope): number[] | null {
  switch (scope) {
    case 'home-top':
      return [1, 2]
    case 'home-bottom':
      return [2, 3]
    case 'top-bottom':
      return [1, 3]
    case 'all':
    default:
      return null
  }
}

/** Generation error: the message is translated on the UI side. */
export class GeneratorError extends Error {
  code: 'not-enough-keys'
  available: number
  requested: number

  constructor(code: 'not-enough-keys', available: number, requested: number) {
    super(`${code}: ${available} < ${requested}`)
    this.code = code
    this.available = available
    this.requested = requested
  }
}

/** Number of independent draws, of which the best-scoring one is kept. */
const ATTEMPTS = 64

type Candidate = TypedKey

/** Index = pivot. Outer = middle + pinky. Ring = ring finger (secondary). */
type FingerRole = 'index' | 'outer' | 'ring'

function roleOf(finger: Finger): FingerRole {
  if (finger === 'LI' || finger === 'RI') return 'index'
  if (finger === 'LM' || finger === 'LP' || finger === 'RM' || finger === 'RP')
    return 'outer'
  return 'ring'
}

function isMiddle(finger: Finger): boolean {
  return finger === 'LM' || finger === 'RM'
}

function isPinky(finger: Finger): boolean {
  return finger === 'LP' || finger === 'RP'
}

/**
 * Weighted draw. Also returns the "surprise" of the choice in bits
 * (-log2 of its probability), used to estimate entropy.
 */
function pickWeighted<T>(
  items: T[],
  weights: number[],
): { item: T; bits: number } {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = randomFloat() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r < 0) return { item: items[i], bits: -Math.log2(weights[i] / total) }
  }
  const last = items.length - 1
  return { item: items[last], bits: -Math.log2(weights[last] / total) }
}

function charAllowed(char: string, charset: CharsetOptions): boolean {
  if (isLetter(char)) {
    if (char === char.toLowerCase() && char !== char.toUpperCase()) {
      return charset.lowercase
    }
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      return charset.uppercase
    }
    return charset.lowercase || charset.uppercase
  }
  if (isDigit(char)) return charset.digits
  if (isSymbol(char)) return charset.symbols
  return false
}

function expandKey(key: KeyDef, charset: CharsetOptions): Candidate[] {
  const out: Candidate[] = []
  if (charAllowed(key.base, charset)) {
    out.push({
      char: key.base,
      keyId: key.id,
      finger: key.finger,
      hand: key.hand,
      row: key.row,
      col: key.col,
      shifted: false,
    })
  }
  if (key.shift !== key.base && charAllowed(key.shift, charset)) {
    out.push({
      char: key.shift,
      keyId: key.id,
      finger: key.finger,
      hand: key.hand,
      row: key.row,
      col: key.col,
      shifted: true,
    })
  }
  return out
}

function handFilter(hand: Hand, mode: HandMode): boolean {
  if (mode === 'both') return true
  return hand === mode
}

/**
 * Prefer home/top rows. Index & outer fingers are first-class;
 * ring is allowed but quieter. Shift is costly.
 */
function comfortWeight(c: Candidate): number {
  let w = 1
  if (c.row === 2) w += 3.4
  else if (c.row === 1) w += 2.6
  else if (c.row === 3) w += 1.5
  else w += 0.15 // number row: useful, but rarely fluid

  const role = roleOf(c.finger)
  if (role === 'index') w *= 1.35
  else if (role === 'outer') {
    // Middle slightly ahead of pinky (more natural reach)
    w *= isMiddle(c.finger) ? 1.28 : 1.18
  } else {
    w *= 0.55
  }

  // Pinky on the number row = unpleasant stretch
  if (c.row === 0 && isPinky(c.finger)) w *= 0.35
  if (c.row === 0) w *= 0.55

  if (c.shifted) w *= 0.5
  if (isDigit(c.char)) w *= 0.82
  return w
}

/**
 * The fluid rhythm: index ↔ (middle | pinky).
 * The index is the pivot; avoid index→index and outer→outer.
 */
function rhythmBonus(prev: Candidate | null, next: Candidate): number {
  if (!prev) {
    // Starting on the index sets the groove
    return roleOf(next.finger) === 'index' ? 2.2 : 0.7
  }

  if (prev.finger === next.finger) return 0.02

  const prevRole = roleOf(prev.finger)
  const nextRole = roleOf(next.finger)

  // Ideal: index ↔ outer (middle / pinky)
  if (
    (prevRole === 'index' && nextRole === 'outer') ||
    (prevRole === 'outer' && nextRole === 'index')
  ) {
    let bonus = 4.2
    // Vary middle and pinky around the index
    if (prevRole === 'index' && isMiddle(next.finger)) bonus *= 1.12
    if (prevRole === 'index' && isPinky(next.finger)) bonus *= 1.08
    if (nextRole === 'index' && isMiddle(prev.finger)) bonus *= 1.1
    if (nextRole === 'index' && isPinky(prev.finger)) bonus *= 1.06
    return bonus
  }

  // Index ↔ ring: acceptable but less groovy
  if (
    (prevRole === 'index' && nextRole === 'ring') ||
    (prevRole === 'ring' && nextRole === 'index')
  ) {
    return 1.35
  }

  // Same role (two indexes, two outers…): breaks the rhythm
  if (prevRole === nextRole) return 0.18

  // Outer ↔ ring: mediocre
  return 0.45
}

function handBonus(
  prev: Candidate | null,
  next: Candidate,
  mode: HandMode,
): number {
  if (!prev || mode !== 'both') return 1
  // Two hands: L/R alternation amplifies the index↔outer rhythm
  return prev.hand !== next.hand ? 1.55 : 0.22
}

/**
 * After an outer finger, avoid repeating the same outer finger type
 * (middle→middle): prefer alternating middle and pinky around the index.
 */
function outerVarietyBonus(sequence: Candidate[], next: Candidate): number {
  if (roleOf(next.finger) !== 'outer') return 1

  // Find the last outer finger used
  for (let i = sequence.length - 1; i >= 0; i--) {
    if (roleOf(sequence[i].finger) !== 'outer') continue
    const prevOuter = sequence[i].finger
    if (prevOuter === next.finger) return 0.35
    // Same "type" (two middles / two pinkies) on different hands: ok
    if (isMiddle(prevOuter) && isMiddle(next.finger)) return 0.85
    if (isPinky(prevOuter) && isPinky(next.finger)) return 0.85
    // Middle then pinky (or the reverse): excellent
    if (isMiddle(prevOuter) !== isMiddle(next.finger)) return 1.35
    return 1
  }
  return 1
}

function expectedRole(index: number): FingerRole {
  // Even positions → index (pivot), odd positions → outer
  return index % 2 === 0 ? 'index' : 'outer'
}

function roleSlotBonus(position: number, next: Candidate): number {
  const expected = expectedRole(position)
  const actual = roleOf(next.finger)
  if (actual === expected) return 2.4
  if (actual === 'ring' && expected === 'outer') return 0.9
  return 0.35
}

function transitionWeight(
  prev: Candidate | null,
  next: Candidate,
  mode: HandMode,
  sequence: Candidate[],
  position: number,
): number {
  return (
    comfortWeight(next) *
    rhythmBonus(prev, next) *
    handBonus(prev, next, mode) *
    outerVarietyBonus(sequence, next) *
    roleSlotBonus(position, next)
  )
}

/**
 * "Index pivot" mode (single hand): the index finger stays on the bottom row
 * and acts as a pivot; between two index strokes, another finger takes its
 * turn (ring, middle, pinky in a random order each cycle). No fingers cross,
 * and the hand barely moves.
 *
 * The index only has 2 keys on its row: key reuse is therefore allowed
 * (never twice in a row, since the index alternates with the other fingers).
 */
const PIVOT_INDEX_ROW = 3
/** Maximum length offered in pivot mode. */
export const PIVOT_MAX_LENGTH = 24
/** Number of draws used to estimate entropy in pivot mode. */
const PIVOT_ENTROPY_SAMPLES = 64
/** Index resting column: other columns require a lateral stretch. */
const INDEX_HOME_COL: Partial<Record<Finger, number>> = { LI: 3, RI: 6 }

type PivotPools = {
  /** Index keys on the bottom row. */
  pivot: Candidate[]
  /** One candidate set per partner finger (ring, middle, pinky). */
  partners: Candidate[][]
}

function buildPivotPools(options: GeneratorOptions): PivotPools | null {
  if (options.handMode === 'both') return null
  const allowedRows = rowsForScope(options.rowScope)
  const pivot: Candidate[] = []
  const byFinger = new Map<Finger, Candidate[]>()

  for (const key of getLayoutKeys(options.layout)) {
    if (key.hand !== options.handMode) continue
    const candidates = expandKey(key, options.charset)
    if (candidates.length === 0) continue

    if (roleOf(key.finger) === 'index') {
      // The index is always on the bottom row, whatever the row restriction.
      if (key.row === PIVOT_INDEX_ROW) pivot.push(...candidates)
      continue
    }
    if (allowedRows && !allowedRows.includes(key.row)) continue
    const list = byFinger.get(key.finger) ?? []
    list.push(...candidates)
    byFinger.set(key.finger, list)
  }

  const partners = [...byFinger.values()]
  if (pivot.length === 0 || partners.length === 0) return null
  return { pivot, partners }
}

function pivotPoolSize(pools: PivotPools): number {
  const chars = new Set<string>()
  for (const c of pools.pivot) chars.add(c.char)
  for (const list of pools.partners) for (const c of list) chars.add(c.char)
  return chars.size
}

/** Uniform draw in [0, n). */
function randomInt(n: number): number {
  return Math.floor(randomFloat() * n)
}

function pivotWeight(c: Candidate, isPivot: boolean): number {
  let w = comfortWeight(c)
  // Lateral index column (b / n): less comfortable than the one below it
  if (isPivot && c.col !== INDEX_HOME_COL[c.finger]) w *= 0.6
  return w
}

function generatePivotSequence(
  pools: PivotPools,
  length: number,
): { sequence: TypedKey[]; bits: number } {
  const used = new Set<string>()
  const sequence: TypedKey[] = []
  let bits = 0

  const draw = (
    candidates: Candidate[],
    isPivot: boolean,
    avoidChar?: string,
  ) => {
    // Prefer characters not yet used, then accept repeats.
    let from = candidates.filter((c) => !used.has(c.char))
    if (from.length === 0) from = candidates
    if (avoidChar !== undefined) {
      const others = from.filter((c) => c.char !== avoidChar)
      if (others.length > 0) from = others
    }
    const picked = pickWeighted(
      from,
      from.map((c) => pivotWeight(c, isPivot)),
    )
    bits += picked.bits
    used.add(picked.item.char)
    sequence.push(picked.item)
  }

  const m = pools.partners.length
  let remaining: number[] = []
  let lastPartner = -1
  let lastPivotChar: string | undefined

  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      draw(pools.pivot, true, lastPivotChar)
      lastPivotChar = sequence[sequence.length - 1].char
      continue
    }

    // New cycle: each partner takes one turn, in a random order.
    if (remaining.length === 0) remaining = pools.partners.map((_, k) => k)
    // Avoid replaying the same finger across a cycle boundary.
    let choices = remaining
    if (m >= 3 && remaining.length === m) {
      choices = remaining.filter((k) => k !== lastPartner)
    }
    const chosen = choices[randomInt(choices.length)]
    bits += Math.log2(choices.length)
    remaining = remaining.filter((k) => k !== chosen)
    lastPartner = chosen
    draw(pools.partners[chosen], false)
  }

  return { sequence, bits }
}

function buildPool(options: GeneratorOptions): Candidate[] {
  const allowedRows = rowsForScope(options.rowScope)
  const keys = getLayoutKeys(options.layout).filter((k) => {
    if (!handFilter(k.hand, options.handMode)) return false
    if (allowedRows && !allowedRows.includes(k.row)) return false
    return true
  })
  const pool: Candidate[] = []
  for (const key of keys) {
    pool.push(...expandKey(key, options.charset))
  }
  const best = new Map<string, Candidate>()
  for (const c of pool) {
    const existing = best.get(c.char)
    if (!existing || comfortWeight(c) > comfortWeight(existing)) {
      best.set(c.char, c)
    }
  }
  return [...best.values()]
}

function isIdealRhythmStep(prev: TypedKey, cur: TypedKey): boolean {
  if (prev.finger === cur.finger) return false
  const a = roleOf(prev.finger)
  const b = roleOf(cur.finger)
  return (
    (a === 'index' && b === 'outer') || (a === 'outer' && b === 'index')
  )
}

function scoreSequence(
  keys: TypedKey[],
  mode: HandMode,
  pivot = false,
): GenerationResult['score'] {
  if (keys.length <= 1) {
    return { alternation: 1, uniqueness: 1, comfort: 1, overall: 1 }
  }

  let rhythmHits = 0
  let comfortSum = 0
  for (let i = 0; i < keys.length; i++) {
    comfortSum += comfortWeight(keys[i]) / 5
    if (i === 0) {
      if (roleOf(keys[i].finger) === 'index') rhythmHits += 0.5
      continue
    }
    const prev = keys[i - 1]
    const cur = keys[i]
    if (pivot) {
      // Pivot: index ↔ any other finger is the ideal transition
      const idx = roleOf(prev.finger) === 'index'
      if (idx !== (roleOf(cur.finger) === 'index')) rhythmHits += 1
    } else if (isIdealRhythmStep(prev, cur)) {
      // Slight bonus if the hands also alternate
      const handOk = mode !== 'both' || prev.hand !== cur.hand
      rhythmHits += handOk ? 1 : 0.75
    } else if (
      (roleOf(prev.finger) === 'index' && roleOf(cur.finger) === 'ring') ||
      (roleOf(prev.finger) === 'ring' && roleOf(cur.finger) === 'index')
    ) {
      rhythmHits += 0.35
    }
  }

  const alternation = Math.min(1, rhythmHits / (keys.length - 1))
  // In pivot mode, index repeats are intended: don't count them.
  const counted = pivot
    ? keys.filter((k) => roleOf(k.finger) !== 'index')
    : keys
  const uniqueness =
    counted.length === 0
      ? 1
      : new Set(counted.map((k) => k.char)).size / counted.length
  const comfort = Math.min(1, comfortSum / keys.length)
  const overall = alternation * 0.55 + uniqueness * 0.2 + comfort * 0.25

  return {
    alternation: round2(alternation),
    uniqueness: round2(uniqueness),
    comfort: round2(comfort),
    overall: round2(overall),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function tryGenerate(
  options: GeneratorOptions,
  pool: Candidate[],
): { sequence: TypedKey[]; bits: number } | null {
  let bits = 0
  const usedChars = new Set<string>()
  const usedKeys = new Set<string>()
  const sequence: TypedKey[] = []

  for (let i = 0; i < options.length; i++) {
    const prev = sequence[i - 1] ?? null
    const want = expectedRole(i)

    const matchesRhythm = (c: Candidate) => {
      if (!prev) return roleOf(c.finger) === 'index' || i > 0
      if (prev.finger === c.finger) return false
      const pr = roleOf(prev.finger)
      const nr = roleOf(c.finger)
      // Strict: index ↔ outer
      return (
        (pr === 'index' && nr === 'outer') ||
        (pr === 'outer' && nr === 'index') ||
        (pr === 'index' && nr === 'ring') ||
        (pr === 'ring' && nr === 'index')
      )
    }

    const unused = (c: Candidate) =>
      !usedChars.has(c.char) && !usedKeys.has(c.keyId)

    // 1) Ideal rhythm + role slot + hand alternation
    const strict = pool.filter((c) => {
      if (!unused(c)) return false
      if (!matchesRhythm(c)) return false
      if (roleOf(c.finger) !== want && !(want === 'outer' && roleOf(c.finger) === 'ring'))
        return false
      if (options.handMode === 'both' && prev && prev.hand === c.hand) return false
      return true
    })

    // 2) Ideal rhythm, flexible hand
    const soft = pool.filter((c) => unused(c) && matchesRhythm(c))

    // 3) At least not the same finger
    const loose = pool.filter(
      (c) => unused(c) && (!prev || prev.finger !== c.finger),
    )

    // 4) Unique keys only
    const lastResort = pool.filter(unused)

    const candidates =
      strict.length > 0
        ? strict
        : soft.length > 0
          ? soft
          : loose.length > 0
            ? loose
            : lastResort.length > 0
              ? lastResort
              : null

    if (!candidates) return null

    const weights = candidates.map((c) =>
      transitionWeight(prev, c, options.handMode, sequence, i),
    )
    const picked = pickWeighted(candidates, weights)
    const chosen = picked.item
    bits += picked.bits
    sequence.push(chosen)
    usedChars.add(chosen.char)
    usedKeys.add(chosen.keyId)
  }

  return { sequence, bits }
}

function countKeys(pool: Candidate[]): number {
  return new Set(pool.map((c) => c.keyId)).size
}

/** log2(n! / (n-k)!): number of arrangements of k elements out of n. */
function log2Arrangements(n: number, k: number): number {
  let bits = 0
  for (let i = 0; i < k; i++) bits += Math.log2(n - i)
  return bits
}

export function generatePassword(options: GeneratorOptions): GenerationResult {
  const charset = normalizeCharset(options.charset)
  const normalized = { ...options, charset }
  const pivotPools = buildPivotPools(normalized)
  if (pivotPools) return generatePivotPassword(normalized, pivotPools)

  const pool = buildPool(normalized)

  // Each key is used only once: the maximum length is the number of distinct
  // keys (a and A share the same key).
  const keyCount = countKeys(pool)
  if (keyCount < normalized.length) {
    throw new GeneratorError('not-enough-keys', keyCount, normalized.length)
  }

  let best: TypedKey[] | null = null
  let bestScore = -1
  let bitsSum = 0
  let bitsCount = 0

  for (let a = 0; a < ATTEMPTS; a++) {
    const attempt = tryGenerate(normalized, pool)
    if (!attempt) continue
    bitsSum += attempt.bits
    bitsCount++
    const s = scoreSequence(attempt.sequence, normalized.handMode).overall
    if (s > bestScore) {
      bestScore = s
      best = attempt.sequence
    }
  }

  let entropyBits: number
  if (best && bitsCount > 0) {
    // Average Shannon entropy of a draw, minus log2(ATTEMPTS) bits
    // to account for keeping only the best of the draws.
    entropyBits = Math.max(0, bitsSum / bitsCount - Math.log2(ATTEMPTS))
  } else {
    // Fallback (theoretically unreachable): a single occurrence per key,
    // drawn via an unbiased shuffle.
    const seen = new Set<string>()
    best = shuffle(pool)
      .filter((c) => (seen.has(c.keyId) ? false : (seen.add(c.keyId), true)))
      .slice(0, normalized.length)
    entropyBits = log2Arrangements(keyCount, normalized.length)
  }

  return {
    password: best.map((k) => k.char).join(''),
    keys: best,
    score: scoreSequence(best, normalized.handMode),
    entropyBits,
    poolSize: pool.length,
  }
}

function generatePivotPassword(
  options: GeneratorOptions,
  pools: PivotPools,
): GenerationResult {
  if (options.length > PIVOT_MAX_LENGTH) {
    throw new GeneratorError('not-enough-keys', PIVOT_MAX_LENGTH, options.length)
  }

  // The password is a raw draw (no "best of N" which would bias the
  // distribution). Entropy is estimated over independent draws.
  const first = generatePivotSequence(pools, options.length)
  let bitsSum = first.bits
  for (let i = 1; i < PIVOT_ENTROPY_SAMPLES; i++) {
    bitsSum += generatePivotSequence(pools, options.length).bits
  }

  return {
    password: first.sequence.map((k) => k.char).join(''),
    keys: first.sequence,
    score: scoreSequence(first.sequence, options.handMode, true),
    entropyBits: bitsSum / PIVOT_ENTROPY_SAMPLES,
    poolSize: pivotPoolSize(pools),
  }
}

function normalizeCharset(charset: CharsetOptions): CharsetOptions {
  if (
    !charset.lowercase &&
    !charset.uppercase &&
    !charset.digits &&
    !charset.symbols
  ) {
    return { lowercase: true, uppercase: false, digits: false, symbols: false }
  }
  return charset
}

export function estimateMaxLength(
  layout: GeneratorOptions['layout'],
  handMode: HandMode,
  charset: CharsetOptions,
  rowScope: RowScope = 'all',
): number {
  const options: GeneratorOptions = {
    layout,
    handMode,
    length: 1,
    charset: normalizeCharset(charset),
    rowScope,
  }
  if (buildPivotPools(options)) return PIVOT_MAX_LENGTH
  return countKeys(buildPool(options))
}


export type Hand = 'left' | 'right'
export type Finger =
  | 'LP'
  | 'LR'
  | 'LM'
  | 'LI'
  | 'RI'
  | 'RM'
  | 'RR'
  | 'RP'

export type LayoutId = 'qwerty' | 'azerty' | 'qwertz' | 'dvorak'
export type HandMode = 'both' | 'left' | 'right'

/** 0 = digits, 1 = top, 2 = home, 3 = bottom */
export type RowScope = 'all' | 'home-top' | 'home-bottom' | 'top-bottom'

export type CharsetOptions = {
  lowercase: boolean
  uppercase: boolean
  digits: boolean
  symbols: boolean
}

export type GeneratorOptions = {
  layout: LayoutId
  handMode: HandMode
  length: number
  charset: CharsetOptions
  rowScope: RowScope
}

export type KeyDef = {
  /** Physical key id (stable across layouts) */
  id: string
  row: number
  col: number
  finger: Finger
  hand: Hand
  /** Unshifted character for this layout */
  base: string
  /** Shifted character for this layout */
  shift: string
}

export type TypedKey = {
  char: string
  keyId: string
  finger: Finger
  hand: Hand
  row: number
  col: number
  shifted: boolean
}

export type GenerationResult = {
  password: string
  keys: TypedKey[]
  score: {
    alternation: number
    uniqueness: number
    comfort: number
    overall: number
  }
  /**
   * Conservative entropy estimate (in bits), assuming the attacker knows the
   * settings AND the Rollpass algorithm.
   */
  entropyBits: number
  /** Number of distinct characters usable with these settings. */
  poolSize: number
}

/**
 * Cryptographically secure randomness source (the browser's CSPRNG).
 * NEVER use Math.random() to generate a password.
 */

/** Uniform float in [0, 1) with 53 bits of randomness. */
export function randomFloat(): number {
  const buf = new Uint32Array(2)
  crypto.getRandomValues(buf)
  // 21 high-order bits + 32 low-order bits = 53 bits
  const high = buf[0] >>> 11
  return (high * 2 ** 32 + buf[1]) / 2 ** 53
}

/** Unbiased Fisher-Yates shuffle (returns a copy). */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

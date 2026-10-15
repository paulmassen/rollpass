import { describe, expect, it, vi } from 'vitest'
import { randomFloat, shuffle } from './random'

describe('random', () => {
  it('randomFloat stays within [0, 1)', () => {
    for (let i = 0; i < 5000; i++) {
      const n = randomFloat()
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1)
    }
  })

  it('randomFloat is roughly uniform', () => {
    const buckets = new Array(10).fill(0)
    const n = 20000
    for (let i = 0; i < n; i++) buckets[Math.floor(randomFloat() * 10)]++
    for (const count of buckets) {
      expect(count).toBeGreaterThan(n / 10 - 300)
      expect(count).toBeLessThan(n / 10 + 300)
    }
  })

  it('shuffle returns a permutation without touching the original', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const out = shuffle(input)
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect([...out].sort()).toEqual(input)
  })

  it('never uses Math.random', async () => {
    const spy = vi.spyOn(Math, 'random')
    randomFloat()
    shuffle([1, 2, 3])
    const { generatePassword } = await import('./generator')
    generatePassword({
      layout: 'qwerty',
      handMode: 'both',
      length: 12,
      charset: { lowercase: true, uppercase: true, digits: false, symbols: false },
      rowScope: 'home-top',
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

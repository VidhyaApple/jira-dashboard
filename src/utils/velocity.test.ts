import { describe, expect, it } from 'vitest'
import { avgSpLastNMonths, rollingAverage, sparklinePath } from './velocity'

describe('velocity helpers', () => {
  it('averages last N months', () => {
    const points = [
      { key: '2026-01', sp: 10, count: 1 },
      { key: '2026-02', sp: 20, count: 1 },
      { key: '2026-03', sp: 30, count: 1 }
    ]
    expect(avgSpLastNMonths(points, 3)).toBe(20)
  })

  it('builds rolling average with leading nulls', () => {
    expect(rollingAverage([10, 20, 30, 40], 3)).toEqual([null, null, 20, 30])
  })

  it('builds sparkline path', () => {
    const path = sparklinePath([1, 2, 3])
    expect(path.startsWith('M')).toBe(true)
  })
})

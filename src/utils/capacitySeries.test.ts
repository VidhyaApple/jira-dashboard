import { describe, expect, it } from 'vitest'
import { buildMonthlyCapacityComparison, computeFilteredPeriodBaseline } from './capacitySeries'

const monthly = {
  labels: ['Jan 2026', 'Feb 2026'],
  monthKeys: ['2026-01', '2026-02'],
  chennaiSp: [10, 20],
  ukSp: [40, 50],
  chennaiN: [1, 2],
  ukN: [4, 5],
  chennaiNoSp: [0, 0],
  ukNoSp: [0, 0]
}

describe('computeFilteredPeriodBaseline', () => {
  it('averages monthly SP across the filtered period', () => {
    const result = computeFilteredPeriodBaseline(monthly)
    expect(result.chennai).toBe(15)
    expect(result.uk).toBe(45)
    expect(result.total).toBe(45)
    expect(result.monthsUsed).toBe(2)
  })
})

describe('buildMonthlyCapacityComparison', () => {
  it('uses Team SP as totalSp (no double-count)', () => {
    const result = buildMonthlyCapacityComparison(monthly, 2, 5, 'capacity')
    expect(result.totalSp).toEqual([40, 50])
    expect(result.totalCapacity).toBe(result.ukCapacity)
  })

  it('uses filtered-period average as baseline when mode is filtered', () => {
    const hist = computeFilteredPeriodBaseline(monthly)
    const result = buildMonthlyCapacityComparison(monthly, 2, 5, 'filtered', hist)
    expect(result.totalCapacity).toBe(45)
    expect(result.chennaiCapacity).toBe(15)
    expect(result.baselineMode).toBe('filtered')
    expect(result.monthsUsed).toBe(2)
  })
})

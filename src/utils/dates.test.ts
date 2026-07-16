import { describe, expect, it } from 'vitest'
import { quarterRange } from './dates'
import { dateRangeLabelForState, resolveDateWindow, headerTitlePartsForState } from './dateFilters'
import { activeRegionValues } from './chartRegion'
import { squadAggregateSeries, squadTotalTickets } from './squadTotals'
import type { Ticket } from '../types/ticket'

describe('resolveDateWindow', () => {
  it('returns null for all time', () => {
    expect(resolveDateWindow({
      dateFilter: 'all',
      filterYear: 2026,
      customFrom: '',
      customTo: ''
    })).toBeNull()
  })

  it('uses filterYear for quarters', () => {
    const window = resolveDateWindow({
      dateFilter: 'q1',
      filterYear: 2023,
      customFrom: '',
      customTo: ''
    })
    expect(window?.start.getFullYear()).toBe(2023)
  })
})

describe('dateRangeLabelForState', () => {
  it('labels YTD with year', () => {
    expect(dateRangeLabelForState({
      dateFilter: 'ytd',
      filterYear: 2025,
      customFrom: '',
      customTo: ''
    })).toBe('YTD 2025')
  })
})

describe('Team-as-total helpers', () => {
  it('activeRegionValues uses Team when filter is all', () => {
    expect(activeRegionValues('all', [1, 2], [10, 20])).toEqual([10, 20])
  })

  it('squadTotalTickets keeps uk only', () => {
    const rows = [
      { region: 'chennai' },
      { region: 'uk' }
    ] as Ticket[]
    expect(squadTotalTickets(rows)).toHaveLength(1)
  })
})

describe('quarterRange', () => {
  it('returns Q2 bounds', () => {
    const { start } = quarterRange(2024, 2)
    expect(start.getMonth()).toBe(3)
  })
})

describe('headerTitlePartsForState', () => {
  it('includes year in quarter title', () => {
    expect(headerTitlePartsForState('SAM', {
      dateFilter: 'q2',
      filterYear: 2024,
      customFrom: '',
      customTo: ''
    })).toEqual({ squad: 'SAM', period: 'Q2 2024' })
  })
})

describe('squadAggregateSeries', () => {
  it('prefers uk', () => {
    expect(squadAggregateSeries([1], [9])).toEqual([9])
  })
})

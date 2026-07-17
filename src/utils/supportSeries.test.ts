import { describe, expect, it } from 'vitest'
import { parseServiceNowDate } from './dates'
import { parseSupportRows } from './supportParser'
import {
  ageDays,
  avgAgeDays,
  buildMonthlyOpenedSeries,
  buildSubcategoryRows
} from './supportSeries'
import type { Ticket } from '../types/ticket'

describe('parseServiceNowDate', () => {
  it('parses DD/MM/YYYY HH:mm:ss', () => {
    const iso = parseServiceNowDate('13/01/2026 18:04:25')
    expect(iso).toBeTruthy()
    const d = new Date(iso!)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(13)
  })

  it('returns undefined for invalid input', () => {
    expect(parseServiceNowDate('')).toBeUndefined()
    expect(parseServiceNowDate('2026-01-13')).toBeUndefined()
  })
})

describe('parseSupportRows', () => {
  it('maps ServiceNow CSV row to Ticket', () => {
    const [row] = parseSupportRows([{
      '\uFEFFNumber': 'INC123',
      'Short Description': 'Test alert',
      'Assignment group': 'UK Ops',
      'Assigned to': 'Alice',
      Opened: '01/04/2026 10:00:00',
      'Opened by': 'Monitor',
      'Age of Task': '86400',
      Closed: '02/04/2026 10:00:00',
      'Closed by': 'Bob',
      Category: 'AdTech',
      Subcategory: 'Sky Data',
      'Parent Incident': 'INC999',
      Priority: '4 - Low',
      State: 'Closed'
    }], 'Service OPS')

    expect(row?.key).toBe('INC123')
    expect(row?.squad).toBe('Service OPS')
    expect(row?.category).toBe('AdTech')
    expect(row?.subcategory).toBe('Sky Data')
    expect(row?.parentKey).toBe('INC999')
    expect(row?.openedAt).toBeTruthy()
    expect(row?.ageSeconds).toBe(86400)
  })
})

describe('supportSeries', () => {
  const tickets: Ticket[] = [
    {
      squad: 'Service OPS',
      developer: 'support',
      region: 'uk',
      openedAt: new Date(2026, 3, 15).toISOString(),
      ageSeconds: 172800,
      category: 'AdTech',
      subcategory: 'Sky'
    },
    {
      squad: 'Service OPS',
      developer: 'support',
      region: 'uk',
      openedAt: new Date(2026, 3, 20).toISOString(),
      ageSeconds: 86400,
      category: 'AdTech',
      subcategory: 'Landmark'
    }
  ]

  it('computes age in days', () => {
    expect(ageDays(tickets[0]!)).toBe(2)
    expect(avgAgeDays(tickets)).toBe(1.5)
  })

  it('aggregates monthly opened counts', () => {
    const series = buildMonthlyOpenedSeries(tickets)
    expect(series.monthKeys).toContain('2026-04')
    expect(series.counts.reduce((a, b) => a + b, 0)).toBe(2)
  })

  it('builds subcategory rows', () => {
    const rows = buildSubcategoryRows(tickets)
    expect(rows).toHaveLength(2)
    expect(rows[0]!.count).toBeGreaterThan(0)
  })
})

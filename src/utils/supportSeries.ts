import type { Ticket } from '../types/ticket'
import { monthKey, monthLabelFromKey, parseTicketDate } from './dates'

export const SECONDS_PER_DAY = 86400

export function ageDays (t: Ticket): number | null {
  if (t.ageSeconds == null || !Number.isFinite(t.ageSeconds)) return null
  return Math.round((t.ageSeconds / SECONDS_PER_DAY) * 10) / 10
}

export function avgAgeDays (tickets: Ticket[]): number | null {
  const ages = tickets.map(ageDays).filter((v): v is number => v != null)
  if (!ages.length) return null
  const sum = ages.reduce((a, v) => a + v, 0)
  return Math.round((sum / ages.length) * 10) / 10
}

function buildMonthKeys (dates: Date[]): string[] {
  if (!dates.length) return []
  let minD = dates[0]!
  let maxD = dates[0]!
  for (const d of dates) {
    if (d < minD) minD = d
    if (d > maxD) maxD = d
  }
  const keys: string[] = []
  let y = minD.getFullYear()
  let m = minD.getMonth()
  const endY = maxD.getFullYear()
  const endM = maxD.getMonth()
  while (y < endY || (y === endY && m <= endM)) {
    keys.push(`${y}-${String(m + 1).padStart(2, '0')}`)
    m += 1
    if (m > 11) { m = 0; y += 1 }
  }
  return keys
}

function aggregateByMonth (
  tickets: Ticket[],
  dateField: 'openedAt' | 'closedAt'
): { labels: string[]; monthKeys: string[]; counts: number[] } {
  const dated = tickets
    .map(t => ({ t, d: parseTicketDate(t[dateField]) }))
    .filter((x): x is { t: Ticket; d: Date } => x.d != null)

  const keys = buildMonthKeys(dated.map(x => x.d))
  const agg: Record<string, number> = {}
  for (const k of keys) agg[k] = 0

  for (const { d } of dated) {
    const k = monthKey(d)
    if (agg[k] != null) agg[k] += 1
    else agg[k] = 1
  }

  return {
    monthKeys: keys,
    labels: keys.map(monthLabelFromKey),
    counts: keys.map(k => agg[k] ?? 0)
  }
}

export function buildMonthlyOpenedSeries (rows: Ticket[]) {
  return aggregateByMonth(rows, 'openedAt')
}

export function buildMonthlyClosedSeries (rows: Ticket[]) {
  return aggregateByMonth(rows, 'closedAt')
}

export function buildMonthlyAgeSeries (rows: Ticket[]) {
  const dated = rows
    .map(t => ({ t, d: parseTicketDate(t.openedAt) }))
    .filter((x): x is { t: Ticket; d: Date } => x.d != null)

  const keys = buildMonthKeys(dated.map(x => x.d))
  const agg: Record<string, { sum: number; n: number }> = {}
  for (const k of keys) agg[k] = { sum: 0, n: 0 }

  for (const { t, d } of dated) {
    const days = ageDays(t)
    if (days == null) continue
    const k = monthKey(d)
    const bucket = agg[k] ?? { sum: 0, n: 0 }
    bucket.sum += days
    bucket.n += 1
    agg[k] = bucket
  }

  const avgDays = keys.map(k => {
    const b = agg[k]
    if (!b?.n) return null
    return Math.round((b.sum / b.n) * 10) / 10
  })

  return {
    monthKeys: keys,
    labels: keys.map(monthLabelFromKey),
    avgDays
  }
}

export type SubcategoryRow = {
  subcategory: string
  category: string
  count: number
}

export function buildSubcategoryRows (tickets: Ticket[]): SubcategoryRow[] {
  const map = new Map<string, { category: string; count: number }>()
  for (const t of tickets) {
    const sub = t.subcategory?.trim() || 'Other'
    const cur = map.get(sub) ?? { category: t.category?.trim() || 'Other', count: 0 }
    cur.count += 1
    map.set(sub, cur)
  }
  return [...map.entries()]
    .map(([subcategory, { category, count }]) => ({ subcategory, category, count }))
    .sort((a, b) => b.count - a.count)
}

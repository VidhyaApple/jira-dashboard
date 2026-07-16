import type { Ticket } from '../types/ticket'
import { monthKey, parseTicketDate, ticketTimelineDate } from './dates'
import { effectiveStoryPoints, sumEffectiveStoryPoints } from './storyPoints'
import { isDoneTicket } from './ticketFilters'
import { squadTotalTickets } from './squadTotals'

export type MonthlySpPoint = { key: string; sp: number; count: number }

export function buildMonthlySpBuckets (
  tickets: Ticket[],
  assumeMissingSpAsOne = false
): MonthlySpPoint[] {
  const buckets = new Map<string, { sp: number; count: number }>()
  for (const t of tickets) {
    const d = parseTicketDate(ticketTimelineDate(t))
    if (!d) continue
    const k = monthKey(d)
    const cur = buckets.get(k) ?? { sp: 0, count: 0 }
    cur.sp += effectiveStoryPoints(t, assumeMissingSpAsOne)
    cur.count += 1
    buckets.set(k, cur)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({ key, sp: v.sp, count: v.count }))
}

export function avgSpLastNMonths (points: MonthlySpPoint[], n: number): number | null {
  if (!points.length) return null
  const slice = points.slice(-n)
  if (!slice.length) return null
  const sum = slice.reduce((a, p) => a + p.sp, 0)
  return Math.round((sum / slice.length) * 10) / 10
}

export function ciecShareOfTeamPct (
  allFiltered: Ticket[],
  assumeMissingSpAsOne = false
): number | null {
  const teamSp = sumEffectiveStoryPoints(squadTotalTickets(allFiltered), assumeMissingSpAsOne)
  if (teamSp <= 0) return null
  const ciecSp = sumEffectiveStoryPoints(
    allFiltered.filter(t => t.region === 'chennai'),
    assumeMissingSpAsOne
  )
  return Math.round((ciecSp / teamSp) * 1000) / 10
}

export function doneSplit (tickets: Ticket[]): { done: number; notDone: number; donePct: number } {
  let done = 0
  let notDone = 0
  for (const t of tickets) {
    if (isDoneTicket(t)) done += 1
    else notDone += 1
  }
  const total = done + notDone
  return {
    done,
    notDone,
    donePct: total ? Math.round((done / total) * 1000) / 10 : 0
  }
}

export function sparklinePath (values: number[]): string {
  if (values.length < 2) {
    return 'M0,20 L20,18 L40,15 L60,12 L80,10 L100,8 L120,6'
  }
  const max = Math.max(...values, 1)
  const step = 120 / (values.length - 1)
  return values.map((v, i) => {
    const x = i * step
    const y = 24 - (v / max) * 20
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

export function rollingAverage (values: number[], window = 3): (number | null)[] {
  return values.map((_, i) => {
    if (i + 1 < window) return null
    const slice = values.slice(i + 1 - window, i + 1)
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length
    return Math.round(avg * 10) / 10
  })
}

import type { Ticket } from '../types/ticket'

export function parseJiraDate (value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const d = new Date(value.trim())
  return Number.isNaN(d.getTime()) ? undefined : value.trim()
}

/** ServiceNow export format: DD/MM/YYYY HH:mm:ss */
export function parseServiceNowDate (value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/)
  if (!match) return undefined
  const [, dd, mm, yyyy, hh, min, sec] = match
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min),
    Number(sec)
  )
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export function timelineFieldFromRow (r: Record<string, unknown>): string | undefined {
  return parseJiraDate(r['Status Category Changed']) ?? parseJiraDate(r.Updated)
}

export function ticketTimelineDate (t: Ticket): string | undefined {
  return t.openedAt ?? t.statusCategoryChanged ?? t.updated
}

export function quarterRange (year: number, quarter: 1 | 2 | 3 | 4): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3
  const start = new Date(year, startMonth, 1, 0, 0, 0, 0)
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)
  return { start, end }
}

export function parseTicketDate (updated?: string): Date | null {
  if (!updated) return null
  const d = new Date(updated)
  return Number.isNaN(d.getTime()) ? null : d
}

export function quarterKey (d: Date): string {
  const y = d.getFullYear()
  const q = Math.floor(d.getMonth() / 3) + 1
  return `${y} Q${q}`
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export function monthKey (d: Date): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

export function monthLabelFromKey (key: string): string {
  const [ys, ms] = key.split('-')
  const y = Number(ys)
  const m = Number(ms) - 1
  if (Number.isNaN(y) || m < 0 || m > 11) return key
  return `${MONTH_SHORT[m]} ${y}`
}

export function dateRangeLabelForFilter (dateFilter: string): string {
  if (dateFilter === 'all') return 'All Time'
  if (dateFilter === 'q1' || dateFilter === 'q2' || dateFilter === 'q3' || dateFilter === 'q4') {
    const year = new Date().getFullYear()
    const quarter = Number(dateFilter.replace('q', '')) as 1 | 2 | 3 | 4
    const { start, end } = quarterRange(year, quarter)
    return `${year} Q${quarter}: ${start.toLocaleDateString()} → ${end.toLocaleDateString()}`
  }
  const now = new Date()
  let days = 0
  if (dateFilter === 'weekly') days = 7
  if (dateFilter === 'twoWeeks') days = 14
  if (dateFilter === 'monthly') days = 30
  const past = new Date()
  past.setDate(now.getDate() - days)
  return `${past.toLocaleDateString()} → ${now.toLocaleDateString()}`
}

/** Short title for header, e.g. "SAM 2026", "SAM Q1 2026", "SAM · Last 7 Days" */
export function headerTitleForFilter (squad: string, dateFilter: string): string {
  const { squad: s, period } = headerTitleParts(squad, dateFilter)
  if (period.startsWith('·')) return `${s} ${period}`
  return `${s} ${period}`
}

export function headerTitleParts (squad: string, dateFilter: string): { squad: string; period: string } {
  const year = new Date().getFullYear()
  if (dateFilter === 'all') return { squad, period: String(year) }
  if (dateFilter === 'q1' || dateFilter === 'q2' || dateFilter === 'q3' || dateFilter === 'q4') {
    const quarter = dateFilter.replace('q', '').toUpperCase()
    return { squad, period: `Q${quarter} ${year}` }
  }
  if (dateFilter === 'weekly') return { squad, period: '· Last 7 Days' }
  if (dateFilter === 'twoWeeks') return { squad, period: '· Last 14 Days' }
  if (dateFilter === 'monthly') return { squad, period: '· Last 30 Days' }
  return { squad, period: String(year) }
}

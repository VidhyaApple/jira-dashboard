import { SQUADS, type Squad } from '../config/squads'
import type { DateFilterMode } from './dateFilters'
import { currentYear } from './dateFilters'

export type UrlDashboardState = {
  squad?: Squad
  dateFilter?: DateFilterMode
  year?: number
  from?: string
  to?: string
  done?: boolean
  assumeSp?: boolean
}

const VALID_FILTERS = new Set<string>([
  'all', 'weekly', 'twoWeeks', 'monthly', 'q1', 'q2', 'q3', 'q4', 'custom', 'ytd', 'last6m'
])

export function parseDashboardUrl (search = typeof window !== 'undefined' ? window.location.search : ''): UrlDashboardState {
  const params = new URLSearchParams(search)
  const result: UrlDashboardState = {}
  const squad = params.get('squad')
  if (squad && (SQUADS as readonly string[]).includes(squad)) {
    result.squad = squad as Squad
  }
  const df = params.get('filter') ?? params.get('dateFilter')
  if (df && VALID_FILTERS.has(df)) result.dateFilter = df as DateFilterMode
  const year = params.get('year')
  if (year && /^\d{4}$/.test(year)) result.year = Number(year)
  const from = params.get('from')
  const to = params.get('to')
  if (from) result.from = from
  if (to) result.to = to
  if (params.get('done') === '1') result.done = true
  if (params.get('done') === '0') result.done = false
  if (params.get('assumeSp') === '1') result.assumeSp = true
  if (params.get('assumeSp') === '0') result.assumeSp = false
  return result
}

export function buildDashboardUrlQuery (state: {
  squad: Squad
  dateFilter: DateFilterMode
  filterYear: number
  customFrom: string
  customTo: string
  doneTicketsOnly: boolean
  assumeMissingSpAsOne: boolean
}): string {
  const params = new URLSearchParams()
  params.set('squad', state.squad)
  if (state.dateFilter !== 'all') params.set('filter', state.dateFilter)
  if (state.filterYear !== currentYear()) params.set('year', String(state.filterYear))
  if (state.dateFilter === 'custom') {
    if (state.customFrom) params.set('from', state.customFrom)
    if (state.customTo) params.set('to', state.customTo)
  }
  if (state.doneTicketsOnly) params.set('done', '1')
  if (state.assumeMissingSpAsOne) params.set('assumeSp', '1')
  const q = params.toString()
  return q ? `?${q}` : ''
}

export function replaceUrlQuery (query: string) {
  if (typeof window === 'undefined') return
  const url = `${window.location.pathname}${query}${window.location.hash}`
  window.history.replaceState({}, '', url)
}

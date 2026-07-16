import { quarterRange } from './dates'

export type DateFilterMode =
  | 'all'
  | 'weekly'
  | 'twoWeeks'
  | 'monthly'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'custom'
  | 'ytd'
  | 'last6m'

export type DateFilterState = {
  dateFilter: DateFilterMode
  filterYear: number
  customFrom: string
  customTo: string
}

const DATE_FILTER_STORAGE_KEY = 'jira-dashboard-date-filter-prefs'

export function currentYear (): number {
  return new Date().getFullYear()
}

export function availableYears (span = 5): number[] {
  const y = currentYear()
  return Array.from({ length: span }, (_, i) => y - i)
}

export function resolveDateWindow (state: DateFilterState): { start: Date; end: Date } | null {
  const { dateFilter, filterYear, customFrom, customTo } = state
  const now = new Date()

  if (dateFilter === 'all') return null

  if (dateFilter === 'custom') {
    if (!customFrom || !customTo) return null
    const start = new Date(customFrom)
    start.setHours(0, 0, 0, 0)
    const end = new Date(customTo)
    end.setHours(23, 59, 59, 999)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    return { start, end }
  }

  if (dateFilter === 'ytd') {
    return {
      start: new Date(filterYear, 0, 1, 0, 0, 0, 0),
      end: filterYear === now.getFullYear()
        ? now
        : new Date(filterYear, 11, 31, 23, 59, 59, 999)
    }
  }

  if (dateFilter === 'last6m') {
    const end = new Date(now)
    const start = new Date(now)
    start.setMonth(start.getMonth() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  if (dateFilter === 'q1' || dateFilter === 'q2' || dateFilter === 'q3' || dateFilter === 'q4') {
    const quarter = Number(dateFilter.replace('q', '')) as 1 | 2 | 3 | 4
    return quarterRange(filterYear, quarter)
  }

  let days = 0
  if (dateFilter === 'weekly') days = 7
  if (dateFilter === 'twoWeeks') days = 14
  if (dateFilter === 'monthly') days = 30
  if (!days) return null
  const threshold = new Date()
  threshold.setDate(now.getDate() - days)
  threshold.setHours(0, 0, 0, 0)
  return { start: threshold, end: now }
}

export function dateRangeLabelForState (state: DateFilterState): string {
  if (state.dateFilter === 'all') return 'All Time'
  if (state.dateFilter === 'custom') {
    if (!state.customFrom || !state.customTo) return 'Custom range'
    return `${new Date(state.customFrom).toLocaleDateString()} → ${new Date(state.customTo).toLocaleDateString()}`
  }
  if (state.dateFilter === 'ytd') return `YTD ${state.filterYear}`
  if (state.dateFilter === 'last6m') return 'Last 6 Months'
  if (state.dateFilter === 'q1' || state.dateFilter === 'q2' || state.dateFilter === 'q3' || state.dateFilter === 'q4') {
    const quarter = Number(state.dateFilter.replace('q', '')) as 1 | 2 | 3 | 4
    const { start, end } = quarterRange(state.filterYear, quarter)
    return `${state.filterYear} Q${quarter}: ${start.toLocaleDateString()} → ${end.toLocaleDateString()}`
  }
  const window = resolveDateWindow(state)
  if (!window) return 'All Time'
  return `${window.start.toLocaleDateString()} → ${window.end.toLocaleDateString()}`
}

export function headerTitlePartsForState (
  squad: string,
  state: DateFilterState
): { squad: string; period: string } {
  const { dateFilter, filterYear } = state
  if (dateFilter === 'all') return { squad, period: String(filterYear) }
  if (dateFilter === 'q1' || dateFilter === 'q2' || dateFilter === 'q3' || dateFilter === 'q4') {
    const quarter = dateFilter.replace('q', '').toUpperCase()
    return { squad, period: `Q${quarter} ${filterYear}` }
  }
  if (dateFilter === 'weekly') return { squad, period: '· Last 7 Days' }
  if (dateFilter === 'twoWeeks') return { squad, period: '· Last 14 Days' }
  if (dateFilter === 'monthly') return { squad, period: '· Last 30 Days' }
  if (dateFilter === 'ytd') return { squad, period: `YTD ${filterYear}` }
  if (dateFilter === 'last6m') return { squad, period: '· Last 6 Months' }
  if (dateFilter === 'custom') return { squad, period: '· Custom' }
  return { squad, period: String(filterYear) }
}

export type StoredDatePrefs = {
  dateFilter?: string
  filterYear?: number
  customFrom?: string
  customTo?: string
}

export function loadDateFilterPrefs (): StoredDatePrefs {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DATE_FILTER_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as StoredDatePrefs
  } catch {
    return {}
  }
}

export function saveDateFilterPrefs (prefs: StoredDatePrefs) {
  localStorage.setItem(DATE_FILTER_STORAGE_KEY, JSON.stringify(prefs))
}

import type { Ticket } from '../types/ticket'

const ASSUME_SP_STORAGE_KEY = 'jira-dashboard-assume-missing-sp-as-one'

export function loadAssumeMissingSpAsOne (): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ASSUME_SP_STORAGE_KEY) === 'true'
}

export function saveAssumeMissingSpAsOne (value: boolean) {
  localStorage.setItem(ASSUME_SP_STORAGE_KEY, value ? 'true' : 'false')
}

export function rawStoryPoints (ticket: Pick<Ticket, 'storyPoints'>): number {
  return ticket.storyPoints || 0
}

export function isMissingStoryPoints (ticket: Pick<Ticket, 'storyPoints'>): boolean {
  return rawStoryPoints(ticket) <= 0
}

/** Effective SP for charts: missing tickets count as 1 when enabled. */
export function effectiveStoryPoints (
  ticket: Pick<Ticket, 'storyPoints'>,
  assumeMissingSpAsOne: boolean
): number {
  const raw = rawStoryPoints(ticket)
  if (raw > 0) return raw
  return assumeMissingSpAsOne ? 1 : 0
}

export function sumEffectiveStoryPoints (
  tickets: Pick<Ticket, 'storyPoints'>[],
  assumeMissingSpAsOne: boolean
): number {
  return tickets.reduce((sum, t) => sum + effectiveStoryPoints(t, assumeMissingSpAsOne), 0)
}

export function countMissingStoryPoints (tickets: Pick<Ticket, 'storyPoints'>[]): number {
  return tickets.filter(isMissingStoryPoints).length
}

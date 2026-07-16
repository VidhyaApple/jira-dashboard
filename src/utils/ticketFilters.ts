import type { Ticket } from '../types/ticket'

const DONE_TICKETS_ONLY_STORAGE_KEY = 'jira-dashboard-done-tickets-only'

export function loadDoneTicketsOnly (): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DONE_TICKETS_ONLY_STORAGE_KEY) === 'true'
}

export function saveDoneTicketsOnly (value: boolean) {
  localStorage.setItem(DONE_TICKETS_ONLY_STORAGE_KEY, value ? 'true' : 'false')
}

export function isDoneTicket (ticket: Pick<Ticket, 'status' | 'statusCategory'>): boolean {
  const category = ticket.statusCategory?.trim().toLowerCase()
  if (category === 'done') return true
  return ticket.status?.trim().toLowerCase() === 'done'
}

export function isClosedTicket (ticket: Pick<Ticket, 'status' | 'statusCategory'>): boolean {
  const status = ticket.status?.trim().toLowerCase()
  if (status === 'closed') return true
  return ticket.statusCategory?.trim().toLowerCase() === 'closed'
}

export function filterClosedTickets<T extends Pick<Ticket, 'status' | 'statusCategory'>> (
  tickets: T[],
  closedOnly: boolean
): T[] {
  if (!closedOnly) return tickets
  return tickets.filter(isClosedTicket)
}

export function filterDoneTickets<T extends Pick<Ticket, 'status' | 'statusCategory'>> (
  tickets: T[],
  doneOnly: boolean
): T[] {
  if (!doneOnly) return tickets
  return tickets.filter(isDoneTicket)
}

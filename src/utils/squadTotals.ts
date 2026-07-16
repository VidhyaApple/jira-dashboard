import type { Ticket } from '../types/ticket'
import { sumEffectiveStoryPoints } from './storyPoints'

/** Team (`uk`) export is the full squad total and includes CIEC — never add regions. */
export function squadTotalTickets<T extends Pick<Ticket, 'region'>> (tickets: T[]): T[] {
  return tickets.filter(t => t.region === 'uk')
}

export function squadTotalSp (
  tickets: Ticket[],
  assumeMissingSpAsOne = false
): number {
  return sumEffectiveStoryPoints(squadTotalTickets(tickets), assumeMissingSpAsOne)
}

/** When region filter is `all`, use Team series as the aggregate (not CIEC + Team). */
export function squadAggregateSeries (
  chennai: number[],
  uk: number[]
): number[] {
  return uk.length ? uk : chennai
}

import { describe, expect, it } from 'vitest'
import { filterDoneTickets, isDoneTicket } from './ticketFilters'
import type { Ticket } from '../types/ticket'

function ticket (partial: Partial<Ticket> & Pick<Ticket, 'squad'>): Ticket {
  return { developer: 'chennai', region: 'chennai', ...partial }
}

describe('isDoneTicket', () => {
  it('matches Done status category', () => {
    expect(isDoneTicket({ statusCategory: 'Done', status: 'Closed' })).toBe(true)
  })

  it('matches Done status when category missing', () => {
    expect(isDoneTicket({ status: 'Done' })).toBe(true)
  })
})

describe('filterDoneTickets', () => {
  const rows = [
    ticket({ squad: 'SAM', statusCategory: 'Done', key: 'A-1' }),
    ticket({ squad: 'SAM', statusCategory: 'To Do', key: 'A-2' }),
    ticket({ squad: 'SAM', status: 'Done', key: 'A-3' })
  ]

  it('returns all when doneOnly is false', () => {
    expect(filterDoneTickets(rows, false)).toHaveLength(3)
  })

  it('keeps only Done tickets when enabled', () => {
    expect(filterDoneTickets(rows, true).map(t => t.key)).toEqual(['A-1', 'A-3'])
  })
})

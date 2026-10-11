import { describe, expect, it } from 'bun:test'
import type { TicketSummary } from '@/lib/parsers/tickets.parser'
import { filterTickets } from './ticket-catalog'

const ticket = (overrides: Partial<TicketSummary>): TicketSummary => ({
  id: '1',
  reference: 'TIS1',
  status: 'new',
  folder: null,
  title: 'Requête',
  author: 'DUPONT Alice',
  lastActivityAt: '2026-01-01T10:00',
  lastAuthor: 'DUPONT Alice',
  ...overrides,
})

const TICKETS = [
  ticket({ id: '1', title: 'Ascenseur bloqué', status: 'in_progress', lastActivityAt: '2026-03-01T10:00' }),
  ticket({ id: '2', title: 'Porte de garage', status: 'done', lastActivityAt: '2026-05-01T10:00' }),
  ticket({ id: '3', title: 'Électricité du hall', status: 'cancelled', author: 'MARTIN Bob', lastActivityAt: '2026-04-01T10:00' }),
]

describe('filterTickets', () => {
  it('should return every ticket with the most recent activity first when the filter is all', () => {
    expect(filterTickets({ tickets: TICKETS, filter: 'all', query: '' }).map(({ id }) => id)).toEqual(['2', '3', '1'])
  })

  it('should keep only unresolved tickets when the filter is open', () => {
    expect(filterTickets({ tickets: TICKETS, filter: 'open', query: '' }).map(({ id }) => id)).toEqual(['1'])
  })

  it('should keep done and cancelled tickets when the filter is closed', () => {
    expect(filterTickets({ tickets: TICKETS, filter: 'closed', query: '' }).map(({ id }) => id)).toEqual(['2', '3'])
  })

  it('should match the author without accents when searching', () => {
    expect(filterTickets({ tickets: TICKETS, filter: 'all', query: 'electricite martin' }).map(({ id }) => id)).toEqual(['3'])
  })
})

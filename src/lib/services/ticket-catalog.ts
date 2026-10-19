import type { TicketStatus, TicketSummary } from '@/lib/parsers/tickets.parser'
import { matchesSearch } from '@/lib/search'

export const TICKET_FILTERS = ['all', 'open', 'closed'] as const
export type TicketFilter = (typeof TICKET_FILTERS)[number]

const CLOSED_STATUSES = new Set<TicketStatus>(['done', 'cancelled'])

const matchesFilter = (ticket: TicketSummary, filter: TicketFilter) => {
  if (filter === 'all') return true
  const isClosed = CLOSED_STATUSES.has(ticket.status)
  return filter === 'closed' ? isClosed : !isClosed
}

const matchesQuery = (ticket: TicketSummary, query: string) =>
  matchesSearch(query, `${ticket.title} ${ticket.reference} ${ticket.author} ${ticket.folder ?? ''}`)

type FilterTicketsInput = {
  tickets: TicketSummary[]
  filter: TicketFilter
  query: string
}

export const filterTickets = ({ tickets, filter, query }: FilterTicketsInput) =>
  tickets
    .filter((ticket) => matchesFilter(ticket, filter))
    .filter((ticket) => matchesQuery(ticket, query))
    .toSorted((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))

export const isClosedStatus = (status: TicketStatus) => CLOSED_STATUSES.has(status)

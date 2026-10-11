import { parseAsString, parseAsStringLiteral } from 'nuqs/server'
import { TICKET_FILTERS } from '@/lib/services/ticket-catalog'

export const ticketsSearchParams = {
  q: parseAsString.withDefault(''),
  filter: parseAsStringLiteral(TICKET_FILTERS).withDefault('all'),
}

export const isTicketFilter = (value: string): value is (typeof TICKET_FILTERS)[number] =>
  TICKET_FILTERS.some((filter) => filter === value)

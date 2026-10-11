import 'server-only'
import { parseHiddenFields } from '@/lib/parsers/form-fields.parser'
import { parseMyAccounts } from '@/lib/parsers/my-accounts.parser'
import { parseTicket, parseTicketFormOptions, parseTicketList } from '@/lib/parsers/tickets.parser'
import { fetchUpstreamHtml, submitUpstreamForm } from '@/lib/upstream/upstream-client'

const CONFIDENTIAL_VISIBILITY_ID = '1'
const PUBLIC_VISIBILITY_ID = '3'
const CREATED_TICKET_PATTERN = /\/tickets\/view\/(\d+)/

export const getTickets = async () => parseTicketList(await fetchUpstreamHtml('/tickets/index'))

export const getTicket = async (ticketId: string) => parseTicket(await fetchUpstreamHtml(`/tickets/view/${ticketId}`))

/**
 * Upstream offers every unit of the residence. Only the units whose label carries the owner's name are kept,
 * falling back to the full list when none matches.
 */
export const getTicketFormOptions = async () => {
  const [formHtml, financialsHtml] = await Promise.all([
    fetchUpstreamHtml('/tickets/add'),
    fetchUpstreamHtml('/financials/index'),
  ])
  const options = parseTicketFormOptions(formHtml)
  const ownerNames = parseMyAccounts(financialsHtml).accounts.map(({ label }) => label.toLowerCase())
  const ownUnits = options.units.filter(({ label }) => ownerNames.some((name) => label.toLowerCase().includes(name)))

  return { folders: options.folders, units: ownUnits.length > 0 ? ownUnits : options.units }
}

type CreateTicketInput = {
  title: string
  content: string
  folderId: string
  unitId: string | null
  isPublic: boolean
  notify: boolean
}

export class TicketNotCreatedError extends Error {
  constructor() {
    super('Upstream did not create the ticket')
    this.name = 'TicketNotCreatedError'
  }
}

/** Creates a ticket upstream and returns its id. */
export const createTicket = async ({ title, content, folderId, unitId, isPublic, notify }: CreateTicketInput) => {
  const body = new URLSearchParams({
    _method: 'POST',
    'data[Ticket][title]': title,
    'data[Ticket][visibility_id]': isPublic ? PUBLIC_VISIBILITY_ID : CONFIDENTIAL_VISIBILITY_ID,
    'data[Ticket][tfolder_id]': folderId,
    'data[Ticket][door_id]': unitId ?? '',
    'data[Ticket][servicebook_id]': '',
    'data[Ticket][content]': content,
    'data[Ticket][notify]': notify ? '1' : '0',
  })
  const location = await submitUpstreamForm('/tickets/add', body)
  const ticketId = location.match(CREATED_TICKET_PATTERN)?.[1]
  if (!ticketId) throw new TicketNotCreatedError()
  return ticketId
}

type CommentTicketInput = {
  ticketId: string
  message: string
}

/** Posts a reply on an existing ticket with the hidden fields of the upstream "Commenter" form (site, message type…). */
export const commentTicket = async ({ ticketId, message }: CommentTicketInput) => {
  const ticketHtml = await fetchUpstreamHtml(`/tickets/view/${ticketId}`)
  const body = new FormData()
  parseHiddenFields(ticketHtml, 'form.tmessage-form').forEach(([name, value]) => body.set(name, value))
  body.set('data[Tfile][message]', message)
  await submitUpstreamForm(`/tickets/tmessage/${ticketId}`, body)
}

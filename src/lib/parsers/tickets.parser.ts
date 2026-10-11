import { load, type CheerioAPI } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'
import { parseUpstreamDateTime } from './upstream-date'

export const TICKET_STATUSES = ['new', 'in_progress', 'waiting', 'done', 'cancelled'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

const STATUS_PATTERNS: [RegExp, TicketStatus][] = [
  [/nouveau/i, 'new'],
  [/cours/i, 'in_progress'],
  [/attente/i, 'waiting'],
  [/trait/i, 'done'],
  [/annul/i, 'cancelled'],
]

const EMPTY_VALUE = 'Vide'

const toStatus = (raw: string): TicketStatus => {
  const match = STATUS_PATTERNS.find(([pattern]) => pattern.test(raw))
  if (!match) throw new Error(`Unknown ticket status: "${raw}"`)
  return match[1]
}

const optional = (raw: string) => {
  const value = cleanText(raw)
  return value === '' || value === EMPTY_VALUE ? null : value
}

const ticketSummarySchema = z.object({
  id: z.string().regex(/^\d+$/),
  reference: z.string().regex(/^TIS\d+$/),
  status: z.enum(TICKET_STATUSES),
  folder: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  lastActivityAt: z.iso.datetime({ local: true }),
  lastAuthor: z.string(),
})

export type TicketSummary = z.infer<typeof ticketSummarySchema>

/** Reads /tickets/index: one row per ticket visible to the logged-in owner. */
export const parseTicketList = (html: string): TicketSummary[] => {
  const $ = load(html)
  const tickets = $('tr[id^="TIS"]')
    .map((_, row) => {
      const cells = $(row).find('td')
      const reference = $(row).attr('id') ?? ''
      return {
        id: reference.replace('TIS', ''),
        reference,
        status: toStatus(cells.eq(0).find('img').attr('src') ?? ''),
        folder: optional(cells.eq(2).text()),
        title: cleanText(cells.eq(3).text()),
        author: cleanText(cells.eq(4).text()),
        lastActivityAt: parseUpstreamDateTime(cells.eq(5).text()),
        lastAuthor: cleanText(cells.eq(6).text()),
      }
    })
    .get()

  return z.array(ticketSummarySchema).parse(tickets)
}

const ticketMessageSchema = z.object({
  id: z.string().regex(/^\d+$/),
  author: z.string().min(1),
  postedAt: z.iso.datetime({ local: true }),
  channel: z.enum(['portal', 'email']),
  subject: z.string().nullable(),
  body: z.string(),
})

const ticketSchema = z.object({
  id: z.string().regex(/^\d+$/),
  reference: z.string().regex(/^TIS\d+$/),
  status: z.enum(TICKET_STATUSES),
  title: z.string(),
  author: z.string(),
  createdAt: z.iso.datetime({ local: true }),
  visibility: z.string().nullable(),
  assignee: z.string().nullable(),
  folder: z.string().nullable(),
  unit: z.string().nullable(),
  messages: z.array(ticketMessageSchema),
})

export type Ticket = z.infer<typeof ticketSchema>
export type TicketMessage = Ticket['messages'][number]

/** Reads the "Label : value" pairs of the ticket header. */
const readHeaderFields = ($: CheerioAPI) =>
  new Map(
    $('#block-ticket-header-container .form-title')
      .map((_, label) => [[cleanText($(label).text()).replace(/\s*:$/, ''), $(label).next('.form-value-text').text()]] as const)
      .get(),
  )

/** Turns a message body into plain text, keeping line breaks, so it can be rendered without injecting HTML. */
const LINE_BREAK_MARKER = ' '

const toPlainText = (element: ReturnType<CheerioAPI>) => {
  const clone = element.clone()
  clone.find('br').replaceWith(LINE_BREAK_MARKER)
  return clone
    .text()
    .replace(/\s+/g, (whitespace) => (whitespace.includes(LINE_BREAK_MARKER) ? whitespace : ' '))
    .split(LINE_BREAK_MARKER)
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Reads /tickets/view/:id. Messages are returned newest first, as upstream displays them.
 * Recipient e-mail addresses of e-mail messages are deliberately not extracted.
 */
export const parseTicket = (html: string): Ticket => {
  const $ = load(html)
  const fields = readHeaderFields($)
  const reference = cleanText($('#block-ticket-header-container .new-ticket').text()).match(/TIS\d+/)?.[0] ?? ''

  const messages = $('#block-ticket-response-container .message-container')
    .map((_, container) => {
      const message = $(container)
      return {
        id: message.attr('id')?.match(/mess(\d+)/)?.[1],
        author: cleanText(message.find('.ticket-name').first().contents().first().text()),
        postedAt: parseUpstreamDateTime(message.find('.ticket-date').text()),
        channel: message.hasClass('tmessage-mail') ? 'email' : 'portal',
        subject: optional(
          message
            .find('.ticket-subtitle')
            .filter((__, subtitle) => $(subtitle).text().includes('Sujet'))
            .text()
            .replace(/^\s*Sujet\s*:\s*/, ''),
        ),
        body: toPlainText(message.find('.ticket-content').first()),
      }
    })
    .get()

  return ticketSchema.parse({
    id: reference.replace('TIS', ''),
    reference,
    status: toStatus($('#status-ticket .icon-status.active').text()),
    title: cleanText(fields.get('Titre') ?? ''),
    author: cleanText(fields.get('De') ?? ''),
    createdAt: parseUpstreamDateTime(fields.get('Date') ?? ''),
    visibility: optional(fields.get('Visibilité') ?? ''),
    assignee: optional(fields.get('Assigné') ?? ''),
    folder: optional(fields.get('Classeur') ?? ''),
    unit: optional(fields.get('Lot') ?? ''),
    messages,
  })
}

const optionSchema = z.object({ value: z.string().regex(/^\d+$/), label: z.string().min(1) })

const ticketFormOptionsSchema = z.object({
  folders: z.array(optionSchema).min(1),
  units: z.array(optionSchema),
})

export type TicketFormOptions = z.infer<typeof ticketFormOptionsSchema>

/** Reads the choices offered by /tickets/add (ticket folders and residence units). */
export const parseTicketFormOptions = (html: string): TicketFormOptions => {
  const $ = load(html)
  const readOptions = (selector: string) =>
    $(`${selector} option`)
      .map((_, option) => ({ value: $(option).attr('value') ?? '', label: cleanText($(option).text()) }))
      .get()
      .filter(({ value }) => value !== '')

  return ticketFormOptionsSchema.parse({
    folders: readOptions('#TicketTfolderId'),
    units: readOptions('#TicketDoorId'),
  })
}

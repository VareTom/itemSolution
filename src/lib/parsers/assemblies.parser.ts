import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'
import { parseUpstreamDate, parseUpstreamDateTime } from './upstream-date'

const TIME_PATTERN = /^\d{1,2}:\d{2}$/
const KIND_SUFFIX_PATTERN = /\s*\(([^)]+)\)\s*$/
const REJECTED_STATUS_PATTERN = /non retenue/i
const CONVOCATIONS_SENT_PATTERN = /convocations? [ée]mises?\s*\((.+)\)/i

const assemblySummarySchema = z.object({
  id: z.string().regex(/^\d+$/),
  name: z.string().min(1),
  kind: z.string().nullable(),
  date: z.iso.date(),
  time: z.string().regex(TIME_PATTERN).nullable(),
  place: z.string(),
})

export type AssemblySummary = z.infer<typeof assemblySummarySchema>

const splitKind = (rawName: string) => {
  const name = cleanText(rawName)
  const kind = name.match(KIND_SUFFIX_PATTERN)?.[1] ?? null
  return { name: name.replace(KIND_SUFFIX_PATTERN, ''), kind }
}

const parseTime = (raw: string) => {
  const time = cleanText(raw)
  return TIME_PATTERN.test(time) ? time : null
}

/** Reads /assemblies/: the general assemblies of the residence, newest first. */
export const parseAssemblyList = (html: string, today?: string): AssemblySummary[] => {
  const $ = load(html)
  const assemblies = $('tr[id^="id"]')
    .map((_, row) => {
      const cells = $(row).find('td')
      const link = cells.eq(1).find('a')
      return {
        id: link.attr('href')?.match(/\/assemblies\/view\/(\d+)/)?.[1],
        ...splitKind(link.text()),
        date: parseUpstreamDate(cells.eq(2).text(), today),
        time: parseTime(cells.eq(3).text()),
        place: cleanText(cells.eq(4).text()),
      }
    })
    .get()

  return z.array(assemblySummarySchema).parse(assemblies)
}

const agendaItemSchema = z.object({
  id: z.string().regex(/^\d+$/),
  title: z.string().min(1),
  status: z.enum(['on_agenda', 'rejected']),
  proposedBy: z.string().nullable(),
  note: z.string().nullable(),
})

const assemblySchema = z.object({
  id: z.string().regex(/^\d+$/),
  name: z.string().min(1),
  date: z.iso.date(),
  time: z.string().regex(TIME_PATTERN).nullable(),
  place: z.string(),
  convocationsSentAt: z.iso.datetime({ local: true }).nullable(),
  annexesDocumentId: z.string().regex(/^\d+$/).nullable(),
  agenda: z.array(agendaItemSchema),
})

export type Assembly = z.infer<typeof assemblySchema>
export type AgendaItem = Assembly['agenda'][number]

/** The agenda tooltip is HTML stored in a title attribute: "<div>Proposé par : …</div><div>Note : …</div>". */
const readTooltipField = (tooltipHtml: string, label: string) => {
  const $ = load(tooltipHtml)
  const line = $('div div')
    .map((_, div) => cleanText($(div).text()))
    .get()
    .find((text) => text.startsWith(label))
  const value = line?.slice(label.length).replace(/^\s*:\s*/, '').trim()
  return value || null
}

/** "CONVOCATIONS EMISES (Thursday 24 September 2026 à 21:09)" → "2026-09-24T21:09". */
const parseConvocationsSentAt = (status: string, today?: string) => {
  const sentAt = status.match(CONVOCATIONS_SENT_PATTERN)?.[1]
  return sentAt ? parseUpstreamDateTime(sentAt, today) : null
}

/** Reads /assemblies/view/:id: header fields, agenda items and the annexes bundle. */
export const parseAssembly = (html: string, assemblyId: string, today?: string): Assembly => {
  const $ = load(html)
  const fields = new Map(
    $('#block-assembly-quickedit-container .input')
      .map((_, input) => [[cleanText($(input).find('label').text()), cleanText($(input).find('span').text())]] as const)
      .get(),
  )

  const agenda = $('#block-content-resolution .block-resolution')
    .map((_, item) => {
      const link = $(item).find('a.icon-edit-resolution')
      const tooltip = link.attr('title') ?? ''
      return {
        id: $(item).attr('id')?.replace('listItem_', ''),
        title: cleanText(link.text()),
        status: REJECTED_STATUS_PATTERN.test($(item).find('.right img').attr('title') ?? '') ? 'rejected' : 'on_agenda',
        proposedBy: readTooltipField(tooltip, 'Proposé par'),
        note: readTooltipField(tooltip, 'Note'),
      }
    })
    .get()

  return assemblySchema.parse({
    id: assemblyId,
    name: splitKind(fields.get('Nom') ?? '').name,
    date: parseUpstreamDate(fields.get('Date') ?? '', today),
    time: parseTime(fields.get('Heure') ?? ''),
    place: fields.get('Lieu') ?? '',
    convocationsSentAt: parseConvocationsSentAt(fields.get('Statut') ?? '', today),
    annexesDocumentId: $('a.download[href^="/docs/get/"]').attr('href')?.match(/\d+/)?.[0] ?? null,
    agenda,
  })
}

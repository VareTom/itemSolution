import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'

const HIDDEN_VALUE = 'Non visible'
const LOT_PATTERN = /^(.+?)\s*\((.+?)\s*\)$/

export const CONTACT_FIELDS = ['email', 'mobile', 'phone', 'address', 'language', 'other'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]

/** Upstream labels, most specific first ("Téléphone portable" before "Téléphone"). */
const FIELD_PATTERNS: [RegExp, ContactField][] = [
  [/^mail|e-mail|courriel/i, 'email'],
  [/portable|gsm|mobiel/i, 'mobile'],
  [/t[ée]l[ée]phone|telefoon/i, 'phone'],
  [/adresse|adres/i, 'address'],
  [/langue|taal/i, 'language'],
]

const directoryEntrySchema = z.object({
  id: z.string().regex(/^\d+$/),
  name: z.string().min(1),
})

export type DirectoryEntry = z.infer<typeof directoryEntrySchema>

/** Reads the contact list of an upstream directory tab (/directories/index/:tab). */
export const parseDirectory = (html: string): DirectoryEntry[] => {
  const $ = load(html)
  const entries = $('.selectable-list li[id^="contact-"]')
    .map((_, item) => ({
      id: ($(item).attr('id') ?? '').replace('contact-', ''),
      name: cleanText($(item).text()),
    }))
    .get()

  return z.array(directoryEntrySchema).parse(entries)
}

const contactDetailSchema = z.object({
  field: z.enum(CONTACT_FIELDS),
  label: z.string().min(1),
  /** null when the person chose to hide it. */
  value: z.string().nullable(),
})

const contactSchema = z.object({
  id: z.string().regex(/^\d+$/),
  name: z.string().min(1),
  status: z.string().nullable(),
  note: z.string().nullable(),
  details: z.array(contactDetailSchema),
  lots: z.array(z.object({ number: z.string().min(1), type: z.string().nullable() })),
})

export type Contact = z.infer<typeof contactSchema>
export type ContactDetail = z.infer<typeof contactDetailSchema>

const toField = (label: string): ContactField =>
  FIELD_PATTERNS.find(([pattern]) => pattern.test(label))?.[1] ?? 'other'

const toLot = (raw: string) => {
  const match = raw.match(LOT_PATTERN)
  return match ? { number: match[1], type: match[2] } : { number: raw, type: null }
}

const multiline = (raw: string) =>
  raw
    .split('\n')
    .map(cleanText)
    .filter(Boolean)
    .join('\n')

/**
 * Reads a contact card (/directories/view_contact/contact-:id).
 * Returns null when upstream shows no contact, e.g. for an unknown id.
 */
export const parseContact = (html: string, id: string): Contact | null => {
  const $ = load(html)
  const profile = $('[id^="block-user-profile"]')
  const status = cleanText(profile.find('.field-status').text())
  profile.find('.field-status').remove()
  const name = cleanText(profile.find('.field-title-bold').first().text())
  if (!name) return null

  const rows = $('#block-user-information tr')
    .toArray()
    .map((row) => {
      const valueCell = $(row).find('.field-value').first()
      valueCell.find('br').replaceWith('\n')
      return { label: cleanText($(row).find('.field-title').text()), value: multiline(valueCell.text()) }
    })
    .filter(({ label }) => label !== '')

  const [lotRows, detailRows] = [
    rows.filter(({ label }) => /^lot/i.test(label)),
    rows.filter(({ label }) => !/^lot/i.test(label)),
  ]
  const note = cleanText(profile.find('.field-note').text())

  return contactSchema.parse({
    id,
    name,
    status: status || null,
    note: note || null,
    details: detailRows.map(({ label, value }) => ({
      field: toField(label),
      label,
      value: value === '' || value === HIDDEN_VALUE ? null : value,
    })),
    lots: lotRows.flatMap(({ value }) => value.split('\n').map(toLot)),
  })
}

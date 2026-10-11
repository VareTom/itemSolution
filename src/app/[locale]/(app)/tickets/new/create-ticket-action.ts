'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales'
import { createTicket } from '@/lib/services/tickets.service'
import { MAX_TICKET_MESSAGE_LENGTH, MAX_TICKET_TITLE_LENGTH } from '../ticket-limits'

const ID_PATTERN = /^\d+$/

const localeSchema = z.enum(LOCALES).catch(DEFAULT_LOCALE)

const ticketSchema = z.object({
  title: z.string().trim().min(1, 'titleRequired').max(MAX_TICKET_TITLE_LENGTH),
  folderId: z.string({ error: 'folderRequired' }).regex(ID_PATTERN, 'folderRequired'),
  unitId: z.union([z.literal(''), z.string().regex(ID_PATTERN)]).optional().transform((value) => value || null),
  content: z.string().trim().min(1, 'contentRequired').max(MAX_TICKET_MESSAGE_LENGTH),
  visibility: z.enum(['confidential', 'public']).catch('confidential'),
  notify: z.literal('on').optional(),
})

type FieldErrorKey = 'titleRequired' | 'folderRequired' | 'contentRequired'

export type CreateTicketState = {
  fieldErrors: Partial<Record<'title' | 'folderId' | 'content', string>>
  formError: string | null
}

const isFieldErrorKey = (value: string): value is FieldErrorKey =>
  ['titleRequired', 'folderRequired', 'contentRequired'].includes(value)

export const createTicketAction = async (
  _previousState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> => {
  const locale = localeSchema.parse(formData.get('locale'))
  const errors = getDictionary(locale).tickets.create.errors
  const parsed = ticketSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map(({ path, message }) => [path[0], isFieldErrorKey(message) ? errors[message] : message]),
    )
    return { fieldErrors, formError: null }
  }

  const { title, folderId, unitId, content, visibility, notify } = parsed.data
  const ticketId = await createTicket({
    title,
    content,
    folderId,
    unitId,
    isPublic: visibility === 'public',
    notify: notify === 'on',
  }).catch(() => null)

  if (!ticketId) return { fieldErrors: {}, formError: errors.failed }
  redirect(`/${locale}/tickets/${ticketId}`)
}

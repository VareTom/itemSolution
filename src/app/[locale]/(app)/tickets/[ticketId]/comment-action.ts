'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales'
import { commentTicket } from '@/lib/services/tickets.service'
import { MAX_TICKET_MESSAGE_LENGTH } from '../ticket-limits'

const localeSchema = z.enum(LOCALES).catch(DEFAULT_LOCALE)

const commentSchema = z.object({
  ticketId: z.string().regex(/^\d+$/),
  message: z.string().trim().min(1).max(MAX_TICKET_MESSAGE_LENGTH),
})

export type CommentState = {
  error: string | null
}

export const commentAction = async (_previousState: CommentState, formData: FormData): Promise<CommentState> => {
  const locale = localeSchema.parse(formData.get('locale'))
  const errors = getDictionary(locale).tickets.comment.errors
  const parsed = commentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: errors.messageRequired }

  const isSent = await commentTicket(parsed.data)
    .then(() => true)
    .catch(() => false)
  if (!isSent) return { error: errors.failed }

  redirect(`/${locale}/tickets/${parsed.data.ticketId}?sent=1`)
}

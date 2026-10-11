'use client'

import { useActionState } from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'
import { MAX_TICKET_MESSAGE_LENGTH } from '../ticket-limits'
import { commentAction, type CommentState } from './comment-action'

const initialState: CommentState = { error: null }

type CommentFormProps = {
  locale: Locale
  ticketId: string
  labels: Dictionary['tickets']['comment']
}

export const CommentForm = ({ locale, ticketId, labels }: CommentFormProps) => {
  const [state, formAction, isPending] = useActionState(commentAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="ticketId" value={ticketId} />
      {state.error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Field>
        <FieldLabel htmlFor="message">{labels.label}</FieldLabel>
        <Textarea
          id="message"
          name="message"
          placeholder={labels.placeholder}
          rows={4}
          maxLength={MAX_TICKET_MESSAGE_LENGTH}
          required
        />
      </Field>
      <Button type="submit" disabled={isPending} className="self-end">
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </form>
  )
}

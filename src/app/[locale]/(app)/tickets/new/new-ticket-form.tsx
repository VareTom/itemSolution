'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'
import type { TicketFormOptions } from '@/lib/parsers/tickets.parser'
import { MAX_TICKET_MESSAGE_LENGTH, MAX_TICKET_TITLE_LENGTH } from '../ticket-limits'
import { createTicketAction, type CreateTicketState } from './create-ticket-action'

const initialState: CreateTicketState = { fieldErrors: {}, formError: null }
const NO_UNIT = ''

type NewTicketFormProps = {
  locale: Locale
  options: TicketFormOptions
  labels: Dictionary['tickets']['create']
}

export const NewTicketForm = ({ locale, options, labels }: NewTicketFormProps) => {
  const [state, formAction, isPending] = useActionState(createTicketAction, initialState)
  const folderItems = options.folders.map(({ value, label }) => ({ value, label }))
  const unitItems = [{ value: NO_UNIT, label: labels.noUnit }, ...options.units]

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      {state.formError && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors.title)}>
          <FieldLabel htmlFor="title">{labels.titleLabel}</FieldLabel>
          <Input id="title" name="title" placeholder={labels.titlePlaceholder} maxLength={MAX_TICKET_TITLE_LENGTH} required />
          <FieldError>{state.fieldErrors.title}</FieldError>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(state.fieldErrors.folderId)}>
            <FieldLabel>{labels.folderLabel}</FieldLabel>
            <Select name="folderId" items={folderItems} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={labels.folderPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {folderItems.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{state.fieldErrors.folderId}</FieldError>
          </Field>
          <Field>
            <FieldLabel>{labels.unitLabel}</FieldLabel>
            <Select name="unitId" items={unitItems} defaultValue={NO_UNIT}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitItems.map(({ value, label }) => (
                  <SelectItem key={value || 'none'} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field data-invalid={Boolean(state.fieldErrors.content)}>
          <FieldLabel htmlFor="content">{labels.contentLabel}</FieldLabel>
          <Textarea id="content" name="content" placeholder={labels.contentPlaceholder} rows={8} maxLength={MAX_TICKET_MESSAGE_LENGTH} required />
          <FieldError>{state.fieldErrors.content}</FieldError>
        </Field>
        <FieldSet>
          <FieldLegend variant="label">{labels.visibilityLabel}</FieldLegend>
          <RadioGroup name="visibility" defaultValue="confidential">
            <Field orientation="horizontal">
              <RadioGroupItem value="confidential" id="visibility-confidential" />
              <FieldContent>
                <FieldLabel htmlFor="visibility-confidential">{labels.confidential}</FieldLabel>
                <FieldDescription>{labels.confidentialHint}</FieldDescription>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="public" id="visibility-public" />
              <FieldContent>
                <FieldLabel htmlFor="visibility-public">{labels.public}</FieldLabel>
                <FieldDescription>{labels.publicHint}</FieldDescription>
              </FieldContent>
            </Field>
          </RadioGroup>
        </FieldSet>
        <Field orientation="horizontal">
          <Checkbox id="notify" name="notify" value="on" defaultChecked />
          <FieldLabel htmlFor="notify">{labels.notify}</FieldLabel>
        </Field>
      </FieldGroup>
      <div className="flex justify-end gap-2">
        <Link href={`/${locale}/tickets`} className={buttonVariants({ variant: 'ghost' })}>
          {labels.cancel}
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  )
}

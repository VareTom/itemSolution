import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, ChevronRightIcon, EyeOffIcon } from 'lucide-react'
import { ContactAvatar } from '@/components/contact-avatar'
import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { ContactDetail } from '@/lib/parsers/directory.parser'
import { getContact } from '@/lib/services/directory.service'
import { cn } from '@/lib/utils'

const CONTACT_ID_PATTERN = /^\d+$/

const hrefFor = ({ field, value }: ContactDetail) => {
  if (!value) return null
  if (field === 'email') return `mailto:${value}`
  if (field === 'phone' || field === 'mobile') return `tel:${value.replace(/[^\d+]/g, '')}`
  return null
}

type DetailRowProps = {
  detail: ContactDetail
  labels: Dictionary['directory']['contact']
  common: Dictionary['common']
}

const DetailRow = ({ detail, labels, common }: DetailRowProps) => {
  const label = detail.field === 'other' ? detail.label : labels.fields[detail.field]
  const href = hrefFor(detail)
  const isCopyable = href !== null

  return (
    <div className="flex items-start justify-between gap-2 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm break-words whitespace-pre-line">
          {detail.value === null && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <EyeOffIcon className="size-3.5" aria-hidden />
              {labels.hidden}
            </span>
          )}
          {detail.value !== null && href && (
            <a href={href} className="font-medium underline-offset-4 hover:underline">
              {detail.value}
            </a>
          )}
          {detail.value !== null && !href && detail.value}
        </dd>
      </div>
      {isCopyable && detail.value && (
        <CopyButton
          value={detail.value}
          ariaLabel={interpolate(common.copy, { label: label.toLowerCase() })}
          copiedMessage={interpolate(common.copied, { label })}
        />
      )}
    </div>
  )
}

const ContactPage = async ({ params }: PageProps<'/[locale]/directory/[contactId]'>) => {
  const { contactId } = await params
  if (!CONTACT_ID_PATTERN.test(contactId)) notFound()

  const [{ locale, t }, result] = await Promise.all([getI18n(), getContact(contactId)])
  if (!result) notFound()

  const { contact, ownedLots } = result
  const labels = t.directory

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/${locale}/directory`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}>
        <ArrowLeftIcon data-icon="inline-start" />
        {labels.back}
      </Link>
      <div className="flex items-center gap-4">
        <ContactAvatar name={contact.name} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight break-words">{contact.name}</h1>
          {contact.status && (
            <Badge variant="secondary" className="w-fit">
              {contact.status}
            </Badge>
          )}
        </div>
      </div>
      {contact.note && <p className="max-w-prose text-sm whitespace-pre-line">{contact.note}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{labels.contact.details}</CardTitle>
          </CardHeader>
          <CardContent>
            {contact.details.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.contact.noDetails}</p>
            ) : (
              <dl className="flex flex-col divide-y">
                {contact.details.map((detail) => (
                  <DetailRow key={detail.label} detail={detail} labels={labels.contact} common={t.common} />
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{labels.contact.lots}</CardTitle>
          </CardHeader>
          <CardContent>
            {ownedLots.length > 0 && (
              <ul className="-my-1 flex flex-col">
                {ownedLots.map((lot) => (
                  <li key={lot.id}>
                    <Link
                      href={`/${locale}/registry/${lot.id}`}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                    >
                      <span className="w-20 shrink-0 text-sm font-medium tabular-nums">{lot.number}</span>
                      <span className="min-w-0 flex-1 text-sm text-muted-foreground">{t.registry.type[lot.type]}</span>
                      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {ownedLots.length === 0 && contact.lots.length > 0 && (
              <ul className="flex flex-col gap-2">
                {contact.lots.map((lot) => (
                  <li key={lot.number} className="flex gap-3 text-sm">
                    <span className="w-20 shrink-0 font-medium tabular-nums">{lot.number}</span>
                    <span className="text-muted-foreground">{lot.type}</span>
                  </li>
                ))}
              </ul>
            )}
            {ownedLots.length === 0 && contact.lots.length === 0 && (
              <p className="text-sm text-muted-foreground">{labels.contact.noLots}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContactPage

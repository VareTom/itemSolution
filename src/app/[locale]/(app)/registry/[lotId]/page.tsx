import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, ChevronRightIcon } from 'lucide-react'
import { ContactAvatar } from '@/components/contact-avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import { getLot } from '@/lib/services/registry.service'
import { cn } from '@/lib/utils'

const LOT_ID_PATTERN = /^\d+$/

const LotPage = async ({ params }: PageProps<'/[locale]/registry/[lotId]'>) => {
  const { lotId } = await params
  if (!LOT_ID_PATTERN.test(lotId)) notFound()

  const [{ locale, t, format }, result] = await Promise.all([getI18n(), getLot(lotId)])
  if (!result) notFound()

  const { lot, details } = result
  const labels = t.registry
  const facts = [
    { label: labels.lot.building, value: details.building },
    { label: labels.lot.floor, value: details.floor },
    {
      label: labels.lot.share,
      value:
        details.share &&
        interpolate(labels.lot.shareValue, {
          parts: format.integer(details.share.parts),
          total: format.integer(details.share.total),
          percent: format.percent(details.share.parts / details.share.total),
        }),
    },
    ...details.extra,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/${locale}/registry`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}>
        <ArrowLeftIcon data-icon="inline-start" />
        {labels.back}
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
          {interpolate(labels.lot.title, { number: lot.number })}
        </h1>
        <Badge variant="secondary" className="w-fit">
          {lot.type === 'other' ? lot.typeLabel : labels.type[lot.type]}
        </Badge>
      </div>
      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {facts.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 rounded-xl border p-4">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{labels.lot.owners}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="-my-1 flex flex-col">
            {lot.owners.map((owner) => {
              const name = owner.name ?? labels.lot.ownerFallback
              return (
                <li key={owner.contactId}>
                  <Link
                    href={`/${locale}/directory/${owner.contactId}`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                  >
                    <ContactAvatar name={name} />
                    <span className="min-w-0 flex-1 text-sm font-medium break-words">{name}</span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default LotPage

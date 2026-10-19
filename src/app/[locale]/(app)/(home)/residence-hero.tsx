import { MapPinIcon } from 'lucide-react'
import { CopyButton } from '@/components/copy-button'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { BankDetails } from '@/lib/parsers/bank-details.parser'
import type { Residence, ResidenceContact } from '@/lib/parsers/residence.parser'

const directionsUrl = (addressLines: string[]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLines.join(', '))}`

type DetailRowProps = {
  label: string
  value: string
  href?: string
  common: Dictionary['common']
}

const DetailRow = ({ label, value, href, common }: DetailRowProps) => (
  <div className="flex min-w-0 items-center justify-between gap-2 py-2">
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">
        {href ? (
          <a href={href} className="underline-offset-4 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
    <CopyButton
      value={value}
      ariaLabel={interpolate(common.copy, { label: label.toLowerCase() })}
      copiedMessage={interpolate(common.copied, { label })}
    />
  </div>
)

type ResidenceHeroProps = {
  residence: Residence
  contact: ResidenceContact
  bankDetails: BankDetails
}

export const ResidenceHero = async ({ residence, contact, bankDetails }: ResidenceHeroProps) => {
  const { t } = await getI18n()
  const labels = t.home

  return (
    <Card className="border-t-4 border-t-primary">
      <CardContent className="grid gap-6 md:grid-cols-[1fr_minmax(0,20rem)] md:gap-10">
        <div className="flex min-w-0 flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-balance break-words sm:text-3xl">
            {residence.name}
          </h1>
          <address className="flex flex-col text-sm text-muted-foreground not-italic">
            {residence.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <a
            href={directionsUrl(residence.addressLines)}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'self-start' })}
          >
            <MapPinIcon />
            {labels.directions}
          </a>
        </div>
        <dl className="flex min-w-0 flex-col divide-y border-t md:border-t-0 md:border-l md:pl-6">
          {contact.email && (
            <DetailRow
              label={labels.details.email}
              value={contact.email}
              href={`mailto:${contact.email}`}
              common={t.common}
            />
          )}
          <DetailRow label={labels.details.iban} value={bankDetails.iban} common={t.common} />
          <DetailRow label={labels.details.bic} value={bankDetails.bic} common={t.common} />
          {contact.companyNumber && (
            <DetailRow label={labels.details.companyNumber} value={contact.companyNumber} common={t.common} />
          )}
        </dl>
      </CardContent>
    </Card>
  )
}

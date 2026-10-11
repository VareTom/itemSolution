import { CopyButton } from '@/components/copy-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { BankDetails } from '@/lib/parsers/bank-details.parser'

type PaymentRowProps = {
  label: string
  value: string
  common: Dictionary['common']
}

const PaymentRow = ({ label, value, common }: PaymentRowProps) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-mono text-sm">{value}</dd>
    </div>
    <CopyButton
      value={value}
      ariaLabel={interpolate(common.copy, { label: label.toLowerCase() })}
      copiedMessage={interpolate(common.copied, { label })}
    />
  </div>
)

type PaymentInstructionsProps = {
  bankDetails: BankDetails
  paymentReference: string | null
  amountDue: number
}

export const PaymentInstructions = async ({ bankDetails, paymentReference, amountDue }: PaymentInstructionsProps) => {
  const { t, format } = await getI18n()
  const labels = t.finances.payment

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{paymentReference ? labels.withReference : labels.withoutReference}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-2 sm:grid-cols-2">
          {amountDue > 0 && <PaymentRow label={labels.amount} value={format.euro(amountDue)} common={t.common} />}
          <PaymentRow label={labels.iban} value={bankDetails.iban} common={t.common} />
          <PaymentRow label={labels.bic} value={bankDetails.bic} common={t.common} />
          {paymentReference && <PaymentRow label={labels.reference} value={paymentReference} common={t.common} />}
        </dl>
      </CardContent>
    </Card>
  )
}

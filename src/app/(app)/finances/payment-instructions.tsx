import { CopyButton } from '@/components/copy-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEuro } from '@/lib/format'
import type { BankDetails } from '@/lib/parsers/bank-details.parser'

type PaymentRowProps = {
  label: string
  value: string
}

const PaymentRow = ({ label, value }: PaymentRowProps) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-mono text-sm">{value}</dd>
    </div>
    <CopyButton value={value} label={label} />
  </div>
)

type PaymentInstructionsProps = {
  bankDetails: BankDetails
  paymentReference: string | null
  amountDue: number
}

export const PaymentInstructions = ({ bankDetails, paymentReference, amountDue }: PaymentInstructionsProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Comment payer</CardTitle>
      <CardDescription>
        Virement sur le compte de la copropriété
        {paymentReference ? ', avec votre communication structurée.' : '. Reprenez la communication indiquée sur votre appel de fonds.'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <dl className="grid gap-2 sm:grid-cols-2">
        {amountDue > 0 && <PaymentRow label="Montant" value={formatEuro(amountDue)} />}
        <PaymentRow label="IBAN" value={bankDetails.iban} />
        <PaymentRow label="BIC" value={bankDetails.bic} />
        {paymentReference && <PaymentRow label="Communication" value={paymentReference} />}
      </dl>
    </CardContent>
  </Card>
)

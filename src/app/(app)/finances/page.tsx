import { PageHeader } from '@/components/page-header'
import { getBankDetails, getFinanceOverview } from '@/lib/services/finances.service'
import { BalanceSummary } from './balance-summary'
import { LedgerTable } from './ledger-table'
import { PaymentInstructions } from './payment-instructions'

const FinancesPage = async () => {
  const [overview, bankDetails] = await Promise.all([getFinanceOverview(), getBankDetails()])

  return (
    <>
      <PageHeader title="Finances" description="Ce que vous devez, ce que vous avez payé, et comment régler." />
      <div className="flex flex-col gap-6">
        <BalanceSummary overview={overview} />
        <PaymentInstructions
          bankDetails={bankDetails}
          paymentReference={overview.paymentReference}
          amountDue={overview.amountDue}
        />
        <LedgerTable entries={overview.entries} />
      </div>
    </>
  )
}

export default FinancesPage

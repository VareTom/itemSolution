import { PageHeader } from '@/components/page-header'
import { getI18n } from '@/lib/i18n/get-i18n'
import { getBankDetails, getFinanceOverview } from '@/lib/services/finances.service'
import { BalanceSummary } from './balance-summary'
import { LedgerTable } from './ledger-table'
import { MyUnits } from './my-units'
import { PaymentInstructions } from './payment-instructions'

const FinancesPage = async () => {
  const [{ t }, overview, bankDetails] = await Promise.all([getI18n(), getFinanceOverview(), getBankDetails()])

  return (
    <>
      <PageHeader title={t.finances.title} description={t.finances.description} />
      <div className="flex flex-col gap-6">
        <BalanceSummary overview={overview} />
        <PaymentInstructions
          bankDetails={bankDetails}
          paymentReference={overview.paymentReference}
          amountDue={overview.amountDue}
        />
        <MyUnits accounts={overview.accounts} />
        <LedgerTable entries={overview.entries} />
      </div>
    </>
  )
}

export default FinancesPage

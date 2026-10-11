import 'server-only'
import { parseAccountLedger } from '@/lib/parsers/account-ledger.parser'
import { parseBankDetails } from '@/lib/parsers/bank-details.parser'
import { parseMyAccounts } from '@/lib/parsers/my-accounts.parser'
import { parseOwnerBalance } from '@/lib/parsers/owner-balance.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'
import { buildFinanceOverview } from './finance-overview'

export const getFinanceOverview = async () => {
  const [financialsIndex, workingCapitalHtml, reserveHtml] = await Promise.all([
    fetchUpstreamHtml('/financials/index'),
    fetchUpstreamHtml('/financials/view_fonds_roulement'),
    fetchUpstreamHtml('/financials/view_fonds_reserve'),
  ])
  const myAccounts = parseMyAccounts(financialsIndex)
  const ledgers = await Promise.all(
    myAccounts.accounts.map(async ({ id }) => ({
      accountId: id,
      ledger: parseAccountLedger(await fetchUpstreamHtml(`/financials/view_account/${id}`)),
    })),
  )

  return buildFinanceOverview({
    myAccounts,
    workingCapitalLines: parseOwnerBalance(workingCapitalHtml),
    reserveLines: parseOwnerBalance(reserveHtml),
    ledgers,
  })
}

export const getBankDetails = async () => parseBankDetails(await fetchUpstreamHtml('/'))

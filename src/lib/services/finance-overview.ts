import type { LedgerEntry } from '@/lib/parsers/account-ledger.parser'
import type { MyAccounts } from '@/lib/parsers/my-accounts.parser'
import type { OwnerBalanceLine } from '@/lib/parsers/owner-balance.parser'

const STRUCTURED_COMMUNICATION_PATTERN = /\b(\d{3})\/(\d{4})\/(\d{5})\b/g
const CENTS = 100

export type FundSummary = {
  debit: number
  credit: number
  balance: number
}

export type FinanceOverview = {
  asOf: string
  totalBalance: number
  amountDue: number
  workingCapital: FundSummary
  reserve: FundSummary
  paymentReference: string | null
  accounts: { id: string; code: string; balance: number }[]
  entries: (LedgerEntry & { kind: 'charge' | 'payment' })[]
}

type BuildFinanceOverviewInput = {
  myAccounts: MyAccounts
  workingCapitalLines: OwnerBalanceLine[]
  reserveLines: OwnerBalanceLine[]
  ledgerEntries: LedgerEntry[]
}

const roundCents = (amount: number) => Math.round(amount * CENTS) / CENTS

const summarizeFund = (lines: OwnerBalanceLine[], accountIds: Set<string>): FundSummary => {
  const ownLines = lines.filter((line) => accountIds.has(line.accountId))
  return {
    debit: roundCents(ownLines.reduce((sum, line) => sum + line.debit, 0)),
    credit: roundCents(ownLines.reduce((sum, line) => sum + line.credit, 0)),
    balance: roundCents(ownLines.reduce((sum, line) => sum + line.balance, 0)),
  }
}

/**
 * Picks the structured communication the owner uses most often in their payment labels
 * (e.g. "997/0078/79647"), formatted the Belgian way: +++997/0078/79647+++.
 */
export const findPaymentReference = (entries: LedgerEntry[]) => {
  const counts = entries
    .flatMap((entry) => [...entry.label.matchAll(STRUCTURED_COMMUNICATION_PATTERN)].map(([reference]) => reference))
    .reduce((tally, reference) => tally.set(reference, (tally.get(reference) ?? 0) + 1), new Map<string, number>())

  const [mostUsed] = [...counts.entries()].sort(([, a], [, b]) => b - a)
  return mostUsed ? `+++${mostUsed[0]}+++` : null
}

export const buildFinanceOverview = ({
  myAccounts,
  workingCapitalLines,
  reserveLines,
  ledgerEntries,
}: BuildFinanceOverviewInput): FinanceOverview => {
  const accountIds = new Set(myAccounts.accounts.map((account) => account.id))
  const workingCapital = summarizeFund(workingCapitalLines, accountIds)
  const reserve = summarizeFund(reserveLines, accountIds)
  const totalBalance = roundCents(workingCapital.balance + reserve.balance)

  return {
    asOf: myAccounts.asOf,
    totalBalance,
    amountDue: Math.max(totalBalance, 0),
    workingCapital,
    reserve,
    paymentReference: findPaymentReference(ledgerEntries),
    accounts: myAccounts.accounts.map(({ id, code, balance }) => ({ id, code, balance })),
    entries: ledgerEntries
      .map((entry) => ({ ...entry, kind: entry.amount < 0 ? ('payment' as const) : ('charge' as const) }))
      .toReversed()
      .toSorted((a, b) => b.date.localeCompare(a.date)),
  }
}

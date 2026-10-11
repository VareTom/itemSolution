import { describe, expect, it } from 'bun:test'
import type { AccountLedger, LedgerEntry } from '@/lib/parsers/account-ledger.parser'
import { buildFinanceOverview, findPaymentReference } from './finance-overview'

const MY_ACCOUNTS = {
  asOf: '2026-10-11',
  accounts: [
    { id: 'account-1', code: '400DUP-625', label: 'DUPONT', balance: 250 },
    { id: 'account-2', code: '400DUP-626', label: 'DUPONT', balance: -20 },
  ],
}

const balanceLine = (accountId: string, debit: number, credit: number) => ({
  accountId,
  code: accountId,
  label: 'owner',
  debit,
  credit,
  balance: debit - credit,
})

const entry = (date: string, label: string, amount: number): LedgerEntry => ({
  date,
  label,
  amount,
  runningBalance: 0,
  documentId: null,
  documentReference: null,
})

const ledgerFor = (accountId: string, entries: LedgerEntry[], units: AccountLedger['units'] = []) => ({
  accountId,
  ledger: { holder: 'DUPONT', units, entries },
})

describe('buildFinanceOverview', () => {
  it('should sum the owner accounts per fund and ignore other owners when the owner has several accounts', () => {
    const overview = buildFinanceOverview({
      myAccounts: MY_ACCOUNTS,
      workingCapitalLines: [balanceLine('account-1', 300, 100), balanceLine('account-2', 100, 50), balanceLine('account-9', 999, 0)],
      reserveLines: [balanceLine('account-2', 10, 30)],
      ledgers: [],
    })

    expect(overview.workingCapital).toEqual({ debit: 400, credit: 150, balance: 250 })
    expect(overview.reserve).toEqual({ debit: 10, credit: 30, balance: -20 })
    expect(overview.totalBalance).toBe(230)
    expect(overview.amountDue).toBe(230)
  })

  it('should report nothing due and a zero reserve when the owner is absent from the reserve balance', () => {
    const overview = buildFinanceOverview({
      myAccounts: MY_ACCOUNTS,
      workingCapitalLines: [balanceLine('account-1', 100, 150)],
      reserveLines: [balanceLine('account-9', 10, 0)],
      ledgers: [],
    })

    expect(overview.reserve).toEqual({ debit: 0, credit: 0, balance: 0 })
    expect(overview.totalBalance).toBe(-50)
    expect(overview.amountDue).toBe(0)
  })

  it('should list ledger entries newest first and tag negative amounts as payments when the ledger spans several dates', () => {
    const overview = buildFinanceOverview({
      myAccounts: MY_ACCOUNTS,
      workingCapitalLines: [],
      reserveLines: [],
      ledgers: [ledgerFor('account-1', [entry('2026-07-01', 'Appel', 294.75), entry('2026-07-26', 'Paiement', -294.75)])],
    })

    expect(overview.entries.map(({ date, kind }) => ({ date, kind }))).toEqual([
      { date: '2026-07-26', kind: 'payment' },
      { date: '2026-07-01', kind: 'charge' },
    ])
  })

  it('should detail each account with its units and fund balances when the owner has several accounts', () => {
    const overview = buildFinanceOverview({
      myAccounts: MY_ACCOUNTS,
      workingCapitalLines: [balanceLine('account-1', 300, 100), balanceLine('account-2', 100, 50)],
      reserveLines: [balanceLine('account-2', 10, 30)],
      ledgers: [
        ledgerFor('account-1', [], [{ reference: '06.', type: 'appartement' }]),
        ledgerFor('account-2', [], [{ reference: '6.P', type: 'parking intérieur' }]),
      ],
    })

    expect(overview.accounts).toEqual([
      {
        id: 'account-1',
        code: '400DUP-625',
        units: [{ reference: '06.', type: 'appartement' }],
        workingCapitalBalance: 200,
        reserveBalance: 0,
      },
      {
        id: 'account-2',
        code: '400DUP-626',
        units: [{ reference: '6.P', type: 'parking intérieur' }],
        workingCapitalBalance: 50,
        reserveBalance: -20,
      },
    ])
  })

  it('should keep the latest operation first when several operations share the same date', () => {
    const overview = buildFinanceOverview({
      myAccounts: MY_ACCOUNTS,
      workingCapitalLines: [],
      reserveLines: [],
      ledgers: [ledgerFor('account-1', [entry('2025-07-01', 'Appel', 314.89), entry('2025-07-01', 'Report', -162.02), entry('2025-07-07', 'Paiement', -314.89)])],
    })

    expect(overview.entries.map(({ label }) => label)).toEqual(['Paiement', 'Report', 'Appel'])
  })
})

describe('findPaymentReference', () => {
  it('should return the most used structured communication when payment labels contain several variants', () => {
    const entries = [
      entry('2026-01-07', 'DUPONT 123/4567/89012', -10),
      entry('2026-02-07', 'DUPONT 123/4567/89012', -10),
      entry('2026-03-07', 'DUPONT 999/8888/77777', -10),
    ]

    expect(findPaymentReference(entries)).toBe('+++123/4567/89012+++')
  })

  it('should return null when no payment label contains a structured communication', () => {
    expect(findPaymentReference([entry('2026-01-07', 'DUPONT', -10)])).toBeNull()
  })
})

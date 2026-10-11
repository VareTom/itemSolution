import { describe, expect, it } from 'bun:test'
import { parseAccountLedger } from './account-ledger.parser'
import { parseBankDetails } from './bank-details.parser'
import { parseMyAccounts } from './my-accounts.parser'
import { parseOwnerBalance } from './owner-balance.parser'

const FINANCIALS_INDEX_HTML = `
<div id="block-financial-account-0" class="block-grey">
  <div class="block-grey-header">Mon compte au 11/10/2026</div>
  <div class="content"><table class="block-table">
    <thead><tr><th class="hidden">Id</th><th>Compte</th><th>Désignation</th><th class="item-number">Solde</th></tr></thead>
    <tbody><tr id="account-100" class="view-account"><td class="hidden">100</td><td>400DUPONT</td><td>DUPONT Alice</td><td class="item-number">294.75</td></tr></tbody>
  </table></div>
</div>`

const OWNER_BALANCE_HTML = `
<div id="block-financial-balance-0"><div class="content"><table class="block-table">
  <thead><tr><th>Compte</th><th>Désignation</th><th>Débit</th><th>Crédit</th><th>Solde</th></tr></thead>
  <tbody>
    <tr class="view-org-account" altrow" id="account-100"><td>400DUPONT</td><td>DUPONT Alice</td><td class="item-number">1768.39</td><td class="item-number">1473.64</td><td class="item-number">294.75</td></tr>
    <tr class="view-org-account" " id="account-200"><td>400MARTIN</td><td>MARTIN Bob</td><td class="item-number">52.40</td><td class="item-number">152.40</td><td class="item-number">-100.00</td></tr>
    <tr class="item-last"><td colspan="2" class="item-total">Total</td><td class="item-total">1820.79</td><td class="item-total">1626.04</td><td class="item-total">194.75</td></tr>
  </tbody>
</table></div></div>`

const LEDGER_HTML = `
<div id="block-account-unit-0" class="block-view"><strong>PARTS</strong> <br/>ACP/06. (appartement) <br/>ACP/6.P (parking intérieur) </div>
<div id="block-financial-account-1"><div class="block-grey-header">Compte DUPONT Alice</div><div class="content"><table class="block-table">
  <tbody>
    <tr><td>01/07/2026</td><td><a href="/docs/view/781544"><img src="/img/fileicon-default.png" />CIS1068880</a></td><td>1er Appel de provision</td><td class="item-number">294.75</td><td class="item-number">294.75</td></tr>
    <tr><td>26/07/2026</td><td></td><td>DUPONT Alice 123/4567/89012</td><td class="item-number">-294.75</td><td class="item-number">0.00</td></tr>
    <tr class="item-last"><td colspan="3" class="item-total">Total</td><td class="item-total">0.00</td><td class="item-total"></td></tr>
  </tbody>
</table></div></div>`

const HOME_HTML = `
<div id="block-infos"><div class="field-title">Info ACP</div><div class="infos-condo">
  Email : acp@example.com <br/> IBAN : BE71 0961 2345 6769 <br/> BIC : GKCCBEBB <br/> N° BCE : 000.000.000 <br/>
</div></div>`

describe('parseMyAccounts', () => {
  it('should return the logged-in owner accounts when the account block is present', () => {
    expect(parseMyAccounts(FINANCIALS_INDEX_HTML)).toEqual({
      asOf: '2026-10-11',
      accounts: [{ id: 'account-100', code: '400DUPONT', label: 'DUPONT Alice', balance: 294.75 }],
    })
  })

  it('should throw when the page has no account block', () => {
    expect(() => parseMyAccounts('<html><body>Maintenance</body></html>')).toThrow()
  })
})

describe('parseOwnerBalance', () => {
  it('should return one line per owner account and skip the total row when rows have malformed attributes', () => {
    expect(parseOwnerBalance(OWNER_BALANCE_HTML)).toEqual([
      { accountId: 'account-100', code: '400DUPONT', label: 'DUPONT Alice', debit: 1768.39, credit: 1473.64, balance: 294.75 },
      { accountId: 'account-200', code: '400MARTIN', label: 'MARTIN Bob', debit: 52.4, credit: 152.4, balance: -100 },
    ])
  })
})

describe('parseAccountLedger', () => {
  it('should return the holder, units and entries without the total row when the ledger is rendered', () => {
    expect(parseAccountLedger(LEDGER_HTML)).toEqual({
      holder: 'DUPONT Alice',
      units: ['ACP/06. (appartement)', 'ACP/6.P (parking intérieur)'],
      entries: [
        {
          date: '2026-07-01',
          documentId: '781544',
          documentReference: 'CIS1068880',
          label: '1er Appel de provision',
          amount: 294.75,
          runningBalance: 294.75,
        },
        {
          date: '2026-07-26',
          documentId: null,
          documentReference: null,
          label: 'DUPONT Alice 123/4567/89012',
          amount: -294.75,
          runningBalance: 0,
        },
      ],
    })
  })
})

describe('parseBankDetails', () => {
  it('should return the residence IBAN and BIC when the info block is present', () => {
    expect(parseBankDetails(HOME_HTML)).toEqual({ iban: 'BE71 0961 2345 6769', bic: 'GKCCBEBB' })
  })
})

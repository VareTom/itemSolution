import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText, parseAmount, parseBelgianDate } from './parse-values'

const accountLedgerSchema = z.object({
  holder: z.string().min(1),
  units: z.array(z.string().min(1)),
  entries: z.array(
    z.object({
      date: z.iso.date(),
      label: z.string(),
      documentId: z.string().regex(/^\d+$/).nullable(),
      documentReference: z.string().nullable(),
      amount: z.number(),
      runningBalance: z.number(),
    }),
  ),
})

export type AccountLedger = z.infer<typeof accountLedgerSchema>
export type LedgerEntry = AccountLedger['entries'][number]

/**
 * Reads /financials/view_account/:accountId — the personal ledger of an owner account.
 * Positive amounts are calls for funds, negative amounts are payments or credits.
 */
export const parseAccountLedger = (html: string): AccountLedger => {
  const $ = load(html)
  const block = $('#block-financial-account-1')

  const units = $('#block-account-unit-0')
    .contents()
    .filter((_, node) => node.type === 'text')
    .map((_, node) => cleanText($(node).text()))
    .get()
    .filter(Boolean)

  const entries = block
    .find('tbody tr:not(.item-last)')
    .map((_, row) => {
      const cells = $(row).find('td')
      const documentLink = cells.eq(1).find('a')
      return {
        date: parseBelgianDate(cells.eq(0).text()),
        documentId: documentLink.attr('href')?.match(/\/docs\/view\/(\d+)/)?.[1] ?? null,
        documentReference: cleanText(documentLink.text()) || null,
        label: cleanText(cells.eq(2).text()),
        amount: parseAmount(cells.eq(3).text()),
        runningBalance: parseAmount(cells.eq(4).text()),
      }
    })
    .get()

  return accountLedgerSchema.parse({
    holder: cleanText(block.find('.block-grey-header').text()).replace(/^Compte\s+/, ''),
    units,
    entries,
  })
}

import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText, parseAmount } from './parse-values'

const ownerBalanceSchema = z.array(
  z.object({
    accountId: z.string().regex(/^account-\d+$/),
    code: z.string().min(1),
    label: z.string(),
    debit: z.number(),
    credit: z.number(),
    balance: z.number(),
  }),
)

export type OwnerBalanceLine = z.infer<typeof ownerBalanceSchema>[number]

/**
 * Reads a "Balance copropriétaire" page (fonds de roulement or fonds de réserve).
 * A positive balance means the owner still owes money, a negative one is an advance.
 */
export const parseOwnerBalance = (html: string): OwnerBalanceLine[] => {
  const $ = load(html)
  const lines = $('#block-financial-balance-0 tbody tr[id^="account-"]')
    .map((_, row) => {
      const cells = $(row).find('td')
      return {
        accountId: $(row).attr('id'),
        code: cleanText(cells.eq(0).text()),
        label: cleanText(cells.eq(1).text()),
        debit: parseAmount(cells.eq(2).text()),
        credit: parseAmount(cells.eq(3).text()),
        balance: parseAmount(cells.eq(4).text()),
      }
    })
    .get()

  return ownerBalanceSchema.parse(lines)
}

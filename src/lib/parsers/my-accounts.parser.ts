import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText, parseAmount, parseBelgianDate } from './parse-values'

const myAccountsSchema = z.object({
  asOf: z.iso.date(),
  accounts: z
    .array(
      z.object({
        id: z.string().regex(/^account-\d+$/),
        code: z.string().min(1),
        label: z.string().min(1),
        balance: z.number(),
      }),
    )
    .min(1),
})

export type MyAccounts = z.infer<typeof myAccountsSchema>

/** Reads the "Mon compte au …" block of /financials/index: the accounts owned by the logged-in user. */
export const parseMyAccounts = (html: string): MyAccounts => {
  const $ = load(html)
  const block = $('#block-financial-account-0')
  const accounts = block
    .find('tr.view-account')
    .map((_, row) => {
      const cells = $(row).find('td')
      return {
        id: $(row).attr('id'),
        code: cleanText(cells.eq(1).text()),
        label: cleanText(cells.eq(2).text()),
        balance: parseAmount(cells.eq(3).text()),
      }
    })
    .get()

  return myAccountsSchema.parse({
    asOf: parseBelgianDate(block.find('.block-grey-header').text()),
    accounts,
  })
}

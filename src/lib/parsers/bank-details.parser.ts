import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'

const bankDetailsSchema = z.object({
  iban: z.string().regex(/^[A-Z]{2}\d{2}[A-Z0-9 ]+$/),
  bic: z.string().min(8),
})

export type BankDetails = z.infer<typeof bankDetailsSchema>

/** Reads the residence bank account from the "Info ACP" block of the upstream home page. */
export const parseBankDetails = (html: string): BankDetails => {
  const $ = load(html)
  const text = cleanText($('#block-infos .infos-condo').first().text())

  return bankDetailsSchema.parse({
    iban: text.match(/IBAN\s*:\s*([A-Z]{2}[\d ]+\d)/)?.[1]?.trim(),
    bic: text.match(/BIC\s*:\s*([A-Z0-9]+)/)?.[1],
  })
}

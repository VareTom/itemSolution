import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'

const residenceSchema = z.object({
  name: z.string().min(1),
  addressLines: z.array(z.string().min(1)),
})

export type Residence = z.infer<typeof residenceSchema>

/** Reads the residence card displayed in the header of every upstream page. */
export const parseResidence = (html: string): Residence => {
  const $ = load(html)
  const card = $('#view-copro .content')
  const addressLines = card
    .find('.field-address1, .field-address2, .field-city')
    .map((_, element) => cleanText($(element).text()))
    .get()

  return residenceSchema.parse({
    name: cleanText(card.find('.field-title').first().text()),
    addressLines,
  })
}

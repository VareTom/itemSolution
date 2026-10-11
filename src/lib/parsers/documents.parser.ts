import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText, parseBelgianDate } from './parse-values'

const BYTES_PER_KILOBYTE = 1024
const TITLE_WITH_REFERENCE_PATTERN = /^(.*)\s+\(([A-Z]+\d+)\)$/

const documentSchema = z.object({
  id: z.string().regex(/^\d+$/),
  title: z.string().min(1),
  reference: z.string().min(1),
  folderId: z.string().regex(/^\d+$/),
  folderName: z.string().min(1),
  date: z.iso.date(),
  sizeBytes: z.number().int().nonnegative(),
  fileType: z.string().min(1),
})

export type UpstreamDocument = z.infer<typeof documentSchema>

const parseSize = (raw: string) => Number.parseInt(raw.replace(/\D/g, ''), 10) * BYTES_PER_KILOBYTE

const splitTitle = (raw: string) => {
  const match = raw.match(TITLE_WITH_REFERENCE_PATTERN)
  if (!match) return { title: raw, reference: raw }
  return { title: match[1], reference: match[2] }
}

/** Reads /docs/ilist, which lists every document of the residence grouped by folder ("classeur"). */
export const parseDocuments = (html: string): UpstreamDocument[] => {
  const $ = load(html)

  const documents = $('.ilist-title')
    .map((_, folderTitle) => {
      const folderId = $(folderTitle).attr('onclick')?.match(/block-dfolder-(\d+)/)?.[1]
      const folderName = cleanText($(folderTitle).text())
      return $(`#block-dfolder-${folderId} .ilist-item`)
        .map((__, item) => {
          const icon = $(item).find('.ilist-item-preview img').attr('src') ?? ''
          return {
            id: $(item).attr('onclick')?.match(/openView\((\d+)\)/)?.[1],
            ...splitTitle(cleanText($(item).find('.ilist-item-title').text())),
            folderId,
            folderName,
            date: parseBelgianDate($(item).find('.item-date').text()),
            sizeBytes: parseSize($(item).find('.item-size').text()),
            fileType: icon.match(/fileicon-([a-z0-9]+)\.png/)?.[1] ?? 'file',
          }
        })
        .get()
    })
    .get()

  return z.array(documentSchema).parse(documents)
}

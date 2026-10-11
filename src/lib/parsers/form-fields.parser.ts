import { load } from 'cheerio'

/** Reads the hidden inputs of an upstream form, so a submission carries exactly what the browser would send. */
export const parseHiddenFields = (html: string, formSelector: string): (readonly [string, string])[] => {
  const $ = load(html)
  return $(`${formSelector} input[type="hidden"]`)
    .map((_, input) => [[$(input).attr('name') ?? '', $(input).attr('value') ?? '']] as const)
    .get()
    .filter(([name]) => name !== '')
}

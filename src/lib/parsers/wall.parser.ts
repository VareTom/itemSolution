import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'
import { parseUpstreamDateTime } from './upstream-date'

const LIKE_ID_PATTERN = /\/walls\/like\/(\d+)/
const THREAD_ID_PATTERN = /#wall-(\d+)/
const LIKE_COUNT_PATTERN = /\((\d+)\)/
const CONTACT_ID_PATTERN = /contact-(\d+)/

const wallMessageSchema = z.object({
  id: z.string().regex(/^\d+$/),
  author: z.string().min(1),
  authorContactId: z.string().nullable(),
  postedAt: z.iso.datetime({ local: true }),
  body: z.string(),
  likes: z.number().int().nonnegative(),
})

const wallPostSchema = wallMessageSchema.extend({
  replies: z.array(wallMessageSchema),
})

export type WallMessage = z.infer<typeof wallMessageSchema>
export type WallPost = z.infer<typeof wallPostSchema>

type ParsedMessage = WallMessage & { threadId: string }

/** Keeps the line breaks residents typed, which cleanText would collapse. */
const tidyBody = (raw: string) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/**
 * Reads the residents' wall of the upstream home page.
 * Upstream markup is not reliably nested (some posts end up inside the previous post's container),
 * so messages are read as a flat sequence of fields, each one starting at its "Par …" line.
 */
export const parseWall = (html: string): WallPost[] => {
  const $ = load(html)
  const fields = $('.block-list-wall').find('.item-by, .item-content, .item-pretty-date, .item-action').toArray()

  const messages = fields.reduce<Partial<ParsedMessage>[]>((parsed, field) => {
    const element = $(field)
    if (element.hasClass('item-by')) {
      const link = element.find('a')
      return [
        ...parsed,
        {
          author: cleanText(link.text()),
          authorContactId: link.attr('href')?.match(CONTACT_ID_PATTERN)?.[1] ?? null,
        },
      ]
    }

    const current = parsed.at(-1)
    if (!current) return parsed
    if (element.hasClass('item-content')) {
      element.find('br').replaceWith('\n')
      current.body = tidyBody(element.text())
    }
    if (element.hasClass('item-pretty-date')) current.postedAt = parseUpstreamDateTime(element.text())
    if (element.hasClass('item-action')) {
      current.id = element.find('.item-lnk-like').attr('href')?.match(LIKE_ID_PATTERN)?.[1]
      current.threadId = element.find('.item-wall-comment').attr('href')?.match(THREAD_ID_PATTERN)?.[1]
      current.likes = Number(element.text().match(LIKE_COUNT_PATTERN)?.[1] ?? 0)
    }
    return parsed
  }, [])

  const isReplyTo = (threadId?: string) => (message: Partial<ParsedMessage>) =>
    message.threadId === threadId && message.id !== threadId

  return z.array(wallPostSchema).parse(
    messages
      .filter((message) => message.id === message.threadId)
      .map((post) => ({ ...post, replies: messages.filter(isReplyTo(post.threadId)) })),
  )
}

/** Reads the short text items of a side block of the home page ("Valve", "Calendrier"). */
export const parseHomeNotices = (html: string, blockSelector: string) => {
  const $ = load(html)
  return $(blockSelector)
    .find('.content li')
    .map((_, item) => cleanText($(item).text()))
    .get()
    .filter((notice) => notice !== '')
}

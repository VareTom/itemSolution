import Link from 'next/link'
import { HeartIcon } from 'lucide-react'
import { ContactAvatar } from '@/components/contact-avatar'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { Formatters } from '@/lib/format'
import type { WallMessage, WallPost } from '@/lib/parsers/wall.parser'

type MessageProps = {
  message: WallMessage
  labels: Dictionary['home']['wall']
  format: Formatters
  contactHref: (contactId: string) => string
  isReply?: boolean
}

const Message = ({ message, labels, format, contactHref, isReply = false }: MessageProps) => (
  <article className="flex gap-3">
    <ContactAvatar name={message.author} size={isReply ? 'default' : 'lg'} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <header className="flex flex-wrap items-baseline gap-x-2">
        {message.authorContactId ? (
          <Link href={contactHref(message.authorContactId)} className="font-medium underline-offset-4 hover:underline">
            {message.author}
          </Link>
        ) : (
          <span className="font-medium">{message.author}</span>
        )}
        <time dateTime={message.postedAt} className="text-xs text-muted-foreground">
          {format.dateTime(message.postedAt)}
        </time>
      </header>
      <p className="max-w-prose text-sm leading-relaxed break-words whitespace-pre-line">{message.body}</p>
      {message.likes > 0 && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <HeartIcon className="size-3.5" aria-hidden />
          {interpolate(labels.likes, { count: String(message.likes) })}
        </p>
      )}
    </div>
  </article>
)

type WallFeedProps = {
  posts: WallPost[]
}

export const WallFeed = async ({ posts }: WallFeedProps) => {
  const { locale, t, format } = await getI18n()
  const labels = t.home.wall
  const contactHref = (contactId: string) => `/${locale}/directory/${contactId}`

  return (
    <section className="flex flex-col gap-3" aria-labelledby="wall-title">
      <div className="flex flex-col gap-1">
        <h2 id="wall-title" className="text-lg font-semibold">
          {labels.title}
        </h2>
        <p className="text-sm text-muted-foreground">{labels.description}</p>
      </div>
      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <ol className="divide-y rounded-xl border">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-4 p-4">
              <Message message={post} labels={labels} format={format} contactHref={contactHref} />
              {post.replies.length > 0 && (
                <ol
                  className="ml-5 flex flex-col gap-4 border-l-2 pl-4 sm:ml-12"
                  aria-label={interpolate(labels.replies, { count: String(post.replies.length) })}
                >
                  {post.replies.map((reply) => (
                    <li key={reply.id}>
                      <Message message={reply} labels={labels} format={format} contactHref={contactHref} isReply />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

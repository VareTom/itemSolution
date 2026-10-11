import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, CircleCheckIcon, MailIcon } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import { getTicket } from '@/lib/services/tickets.service'
import { cn } from '@/lib/utils'
import { TicketStatusBadge } from '../ticket-status-badge'
import { CommentForm } from './comment-form'

const TICKET_ID_PATTERN = /^\d+$/

const TicketPage = async ({ params, searchParams }: PageProps<'/[locale]/tickets/[ticketId]'>) => {
  const [{ ticketId }, { sent }] = await Promise.all([params, searchParams])
  if (!TICKET_ID_PATTERN.test(ticketId)) notFound()

  const [{ locale, t, format }, ticket] = await Promise.all([getI18n(), getTicket(ticketId)])
  const labels = t.tickets
  const details = [
    { label: labels.details.createdAt, value: format.dateTime(ticket.createdAt) },
    { label: labels.details.assignee, value: ticket.assignee },
    { label: labels.details.folder, value: ticket.folder },
    { label: labels.details.unit, value: ticket.unit },
    { label: labels.details.visibility, value: ticket.visibility },
  ].filter((detail) => detail.value !== null)
  const thread = ticket.messages.toReversed()

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/${locale}/tickets`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}>
        <ArrowLeftIcon data-icon="inline-start" />
        {labels.back}
      </Link>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={ticket.status} label={labels.statuses[ticket.status]} />
          <span className="text-sm text-muted-foreground">{ticket.reference}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
        <p className="text-sm text-muted-foreground">{interpolate(labels.openedBy, { author: ticket.author })}</p>
      </div>
      <dl className="grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {sent && (
        <Alert>
          <CircleCheckIcon />
          <AlertTitle>{labels.comment.sent}</AlertTitle>
        </Alert>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="flex items-baseline gap-2 text-lg font-semibold">
          {labels.thread}
          <span className="text-sm font-normal text-muted-foreground">
            {interpolate(labels.messageCount, { count: thread.length })}
          </span>
        </h2>
        <ol className="flex flex-col gap-3">
          {thread.map((message) => (
            <li key={message.id}>
              <Card className={cn(message.channel === 'email' && 'bg-muted/40')}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {message.author}
                    {message.channel === 'email' && (
                      <Badge variant="secondary">
                        <MailIcon />
                        {labels.emailBadge}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {format.dateTime(message.postedAt)}
                    {message.subject && ` · ${interpolate(labels.subject, { subject: message.subject })}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>
      <Card>
        <CardContent>
          <CommentForm locale={locale} ticketId={ticket.id} labels={labels.comment} />
        </CardContent>
      </Card>
    </div>
  )
}

export default TicketPage

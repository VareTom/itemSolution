import Link from 'next/link'
import { ChevronRightIcon, PlusIcon, SearchXIcon } from 'lucide-react'
import { createSearchParamsCache } from 'nuqs/server'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import { filterTickets } from '@/lib/services/ticket-catalog'
import { getTickets } from '@/lib/services/tickets.service'
import { ticketsSearchParams } from './search-params'
import { TicketStatusBadge } from './ticket-status-badge'
import { TicketsToolbar } from './tickets-toolbar'

const searchParamsCache = createSearchParamsCache(ticketsSearchParams)

const TicketsPage = async ({ searchParams }: PageProps<'/[locale]/tickets'>) => {
  const [{ locale, t, format }, allTickets] = await Promise.all([getI18n(), getTickets()])
  const { q, filter } = searchParamsCache.parse(await searchParams)
  const tickets = filterTickets({ tickets: allTickets, filter, query: q })
  const labels = t.tickets

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={labels.title} description={labels.description} />
        <Link href={`/${locale}/tickets/new`} className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" />
          {labels.create.cta}
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <TicketsToolbar labels={labels} />
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
            <SearchXIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">{labels.emptyTitle}</p>
            <p className="text-sm text-muted-foreground">{labels.emptyDescription}</p>
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/${locale}/tickets/${ticket.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <TicketStatusBadge status={ticket.status} label={labels.statuses[ticket.status]} />
                      <span className="font-medium">{ticket.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ticket.reference}
                      {ticket.folder && ` · ${ticket.folder}`} · {interpolate(labels.openedBy, { author: ticket.author })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {interpolate(labels.lastActivity, {
                        date: format.dateTime(ticket.lastActivityAt),
                        author: ticket.lastAuthor,
                      })}
                    </p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default TicketsPage

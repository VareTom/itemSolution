import { Badge } from '@/components/ui/badge'
import type { TicketStatus } from '@/lib/parsers/tickets.parser'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<TicketStatus, string> = {
  new: 'border-sky-600/30 text-sky-700 dark:text-sky-400',
  in_progress: 'border-amber-600/30 text-amber-700 dark:text-amber-400',
  waiting: 'border-violet-600/30 text-violet-700 dark:text-violet-400',
  done: 'border-emerald-600/30 text-emerald-700 dark:text-emerald-400',
  cancelled: 'text-muted-foreground',
}

type TicketStatusBadgeProps = {
  status: TicketStatus
  label: string
}

export const TicketStatusBadge = ({ status, label }: TicketStatusBadgeProps) => (
  <Badge variant="outline" className={cn(STATUS_STYLES[status])}>
    {label}
  </Badge>
)

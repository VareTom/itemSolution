import Link from 'next/link'
import { FileTextIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { FinanceOverview } from '@/lib/services/finance-overview'
import { cn } from '@/lib/utils'

type LedgerTableProps = {
  entries: FinanceOverview['entries']
}

export const LedgerTable = async ({ entries }: LedgerTableProps) => {
  const { locale, t, format } = await getI18n()
  const labels = t.finances.ledger

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.date}</TableHead>
              <TableHead>{labels.operation}</TableHead>
              <TableHead className="text-right">{labels.amount}</TableHead>
              <TableHead className="hidden text-right sm:table-cell">{labels.balance}</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">{labels.document}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow key={`${entry.date}-${index}`}>
                <TableCell className="tabular-nums text-muted-foreground">{format.shortDate(entry.date)}</TableCell>
                <TableCell className="max-w-64 whitespace-normal">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={entry.kind === 'payment' ? 'secondary' : 'outline'}>
                      {entry.kind === 'payment' ? labels.payment : labels.charge}
                    </Badge>
                    <span>{entry.label}</span>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium tabular-nums',
                    entry.kind === 'payment' && 'text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  {entry.kind === 'payment' ? '−' : '+'}
                  {format.euro(Math.abs(entry.amount))}
                </TableCell>
                <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                  {format.euro(entry.runningBalance)}
                </TableCell>
                <TableCell>
                  {entry.documentId && (
                    <Link
                      href={`/${locale}/documents?preview=${entry.documentId}`}
                      className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                      aria-label={interpolate(labels.viewDocument, { reference: entry.documentReference ?? '' })}
                    >
                      <FileTextIcon />
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

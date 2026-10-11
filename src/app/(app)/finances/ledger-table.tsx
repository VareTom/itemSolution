import Link from 'next/link'
import { FileTextIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatEuro, formatShortDate } from '@/lib/format'
import type { FinanceOverview } from '@/lib/services/finance-overview'
import { cn } from '@/lib/utils'

type LedgerTableProps = {
  entries: FinanceOverview['entries']
}

export const LedgerTable = ({ entries }: LedgerTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Historique de mon compte</CardTitle>
      <CardDescription>Appels de fonds et paiements, du plus récent au plus ancien.</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Opération</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Solde</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Document</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={`${entry.date}-${index}`}>
              <TableCell className="tabular-nums text-muted-foreground">{formatShortDate(entry.date)}</TableCell>
              <TableCell className="max-w-64 whitespace-normal">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={entry.kind === 'payment' ? 'secondary' : 'outline'}>
                    {entry.kind === 'payment' ? 'Paiement' : 'Appel'}
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
                {formatEuro(Math.abs(entry.amount))}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatEuro(entry.runningBalance)}
              </TableCell>
              <TableCell>
                {entry.documentId && (
                  <Link
                    href={`/documents?preview=${entry.documentId}`}
                    className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                    aria-label={`Voir le document ${entry.documentReference ?? ''}`}
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

import { CircleCheckIcon, CircleAlertIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatEuro } from '@/lib/format'
import type { FinanceOverview, FundSummary } from '@/lib/services/finance-overview'
import { cn } from '@/lib/utils'

const FundStatusBadge = ({ balance }: { balance: number }) => {
  if (balance > 0) return <Badge variant="destructive">À payer</Badge>
  if (balance < 0) return <Badge variant="secondary">Avance</Badge>
  return (
    <Badge variant="outline" className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400">
      À jour
    </Badge>
  )
}

type FundCardProps = {
  title: string
  description: string
  fund: FundSummary
}

const FundCard = ({ title, description, fund }: FundCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <CardAction>
        <FundStatusBadge balance={fund.balance} />
      </CardAction>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <p className="text-2xl font-semibold tabular-nums">{formatEuro(Math.abs(fund.balance))}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">Appelé</dt>
          <dd className="tabular-nums">{formatEuro(fund.debit)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Payé</dt>
          <dd className="tabular-nums">{formatEuro(fund.credit)}</dd>
        </div>
      </dl>
    </CardContent>
  </Card>
)

type BalanceSummaryProps = {
  overview: FinanceOverview
}

export const BalanceSummary = ({ overview }: BalanceSummaryProps) => {
  const isUpToDate = overview.amountDue === 0

  return (
    <div className="flex flex-col gap-4">
      <Card
        className={cn(
          'border-l-4',
          isUpToDate ? 'border-l-emerald-500' : 'border-l-destructive',
        )}
      >
        <CardHeader>
          <CardDescription>Situation au {formatDate(overview.asOf)}</CardDescription>
          <CardTitle className="flex items-center gap-2 text-3xl tabular-nums">
            {isUpToDate ? (
              <>
                <CircleCheckIcon className="size-7 text-emerald-600" />
                Vous êtes à jour
              </>
            ) : (
              <>
                <CircleAlertIcon className="size-7 text-destructive" />
                {formatEuro(overview.amountDue)} à payer
              </>
            )}
          </CardTitle>
          {overview.totalBalance < 0 && (
            <CardDescription>Vous disposez d’une avance de {formatEuro(-overview.totalBalance)}.</CardDescription>
          )}
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <FundCard
          title="Fonds de roulement"
          description="Charges courantes de l’immeuble"
          fund={overview.workingCapital}
        />
        <FundCard title="Fonds de réserve" description="Épargne pour les gros travaux" fund={overview.reserve} />
      </div>
    </div>
  )
}

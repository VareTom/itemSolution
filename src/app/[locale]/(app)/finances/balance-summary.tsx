import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { Formatters } from '@/lib/format'
import type { FinanceOverview, FundSummary } from '@/lib/services/finance-overview'
import { cn } from '@/lib/utils'

type FundStatusBadgeProps = {
  balance: number
  labels: Dictionary['finances']['status']
}

const FundStatusBadge = ({ balance, labels }: FundStatusBadgeProps) => {
  if (balance > 0) return <Badge variant="destructive">{labels.due}</Badge>
  if (balance < 0) return <Badge variant="secondary">{labels.advance}</Badge>
  return (
    <Badge variant="outline" className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400">
      {labels.upToDate}
    </Badge>
  )
}

type FundCardProps = {
  fund: FundSummary
  texts: Dictionary['finances']['workingCapital']
  t: Dictionary['finances']
  format: Formatters
}

const FundCard = ({ fund, texts, t, format }: FundCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{texts.title}</CardTitle>
      <CardDescription>{texts.description}</CardDescription>
      <CardAction>
        <FundStatusBadge balance={fund.balance} labels={t.status} />
      </CardAction>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <p className="text-2xl font-semibold tabular-nums">{format.euro(Math.abs(fund.balance))}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">{t.called}</dt>
          <dd className="tabular-nums">{format.euro(fund.debit)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t.paid}</dt>
          <dd className="tabular-nums">{format.euro(fund.credit)}</dd>
        </div>
      </dl>
    </CardContent>
  </Card>
)

type BalanceSummaryProps = {
  overview: FinanceOverview
}

export const BalanceSummary = async ({ overview }: BalanceSummaryProps) => {
  const { t, format } = await getI18n()
  const isUpToDate = overview.amountDue === 0

  return (
    <div className="flex flex-col gap-4">
      <Card className={cn('border-l-4', isUpToDate ? 'border-l-emerald-500' : 'border-l-destructive')}>
        <CardHeader>
          <CardDescription>{interpolate(t.finances.asOf, { date: format.date(overview.asOf) })}</CardDescription>
          <CardTitle className="flex items-center gap-2 text-3xl tabular-nums">
            {isUpToDate ? (
              <>
                <CircleCheckIcon className="size-7 text-emerald-600" />
                {t.finances.upToDate}
              </>
            ) : (
              <>
                <CircleAlertIcon className="size-7 text-destructive" />
                {interpolate(t.finances.amountDue, { amount: format.euro(overview.amountDue) })}
              </>
            )}
          </CardTitle>
          {overview.totalBalance < 0 && (
            <CardDescription>
              {interpolate(t.finances.advance, { amount: format.euro(-overview.totalBalance) })}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <FundCard fund={overview.workingCapital} texts={t.finances.workingCapital} t={t.finances} format={format} />
        <FundCard fund={overview.reserve} texts={t.finances.reserve} t={t.finances} format={format} />
      </div>
    </div>
  )
}

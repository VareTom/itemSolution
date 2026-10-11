import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Formatters } from '@/lib/format'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { AccountSummary } from '@/lib/services/finance-overview'
import { cn } from '@/lib/utils'

type UnitBadgesProps = {
  units: AccountSummary['units']
  fallbackType: string
}

const UnitBadges = ({ units, fallbackType }: UnitBadgesProps) => (
  <div className="flex flex-wrap gap-2">
    {units.map(({ reference, type }) => (
      <Badge key={`${reference}-${type}`} variant="outline" className="capitalize">
        {type ?? fallbackType} · {reference}
      </Badge>
    ))}
  </div>
)

const SignedAmount = ({ amount, format }: { amount: number; format: Formatters }) => (
  <span
    className={cn(
      'tabular-nums',
      amount > 0 && 'text-destructive',
      amount < 0 && 'text-emerald-700 dark:text-emerald-400',
    )}
  >
    {format.euro(amount)}
  </span>
)

type MyUnitsProps = {
  accounts: AccountSummary[]
}

export const MyUnits = async ({ accounts }: MyUnitsProps) => {
  const { t, format } = await getI18n()
  const labels = t.finances.units
  const [singleAccount] = accounts
  const hasSeveralAccounts = accounts.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>
          {hasSeveralAccounts
            ? interpolate(labels.severalAccounts, { count: accounts.length })
            : interpolate(labels.singleAccount, { code: singleAccount.code })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasSeveralAccounts ? (
          <Accordion>
            {accounts.map((account) => (
              <AccordionItem key={account.id} value={account.id}>
                <AccordionTrigger>
                  <span className="flex flex-1 items-center justify-between gap-4 pr-2">
                    <span className="font-mono text-sm">{account.code}</span>
                    <SignedAmount amount={account.workingCapitalBalance + account.reserveBalance} format={format} />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3">
                  <UnitBadges units={account.units} fallbackType={labels.unit} />
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">{t.finances.workingCapital.title}</dt>
                      <dd>
                        <SignedAmount amount={account.workingCapitalBalance} format={format} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">{t.finances.reserve.title}</dt>
                      <dd>
                        <SignedAmount amount={account.reserveBalance} format={format} />
                      </dd>
                    </div>
                  </dl>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <UnitBadges units={singleAccount.units} fallbackType={labels.unit} />
        )}
      </CardContent>
    </Card>
  )
}

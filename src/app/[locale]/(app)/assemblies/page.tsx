import Link from 'next/link'
import { CalendarIcon, ChevronRightIcon, MapPinIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import { brusselsToday } from '@/lib/parsers/upstream-date'
import { getAssemblies } from '@/lib/services/assemblies.service'

const AssembliesPage = async () => {
  const [{ locale, t, format }, assemblies] = await Promise.all([getI18n(), getAssemblies()])
  const labels = t.assemblies
  const [featured, ...previous] = assemblies

  if (!featured) {
    return (
      <>
        <PageHeader title={labels.title} description={labels.description} />
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      </>
    )
  }

  const isUpcoming = featured.date >= brusselsToday()
  const when = (date: string, time: string | null) =>
    time ? interpolate(labels.when, { date: format.date(date), time }) : format.date(date)

  return (
    <>
      <PageHeader title={labels.title} description={labels.description} />
      <div className="flex flex-col gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardDescription>{isUpcoming ? labels.upcoming : labels.latest}</CardDescription>
            <CardTitle className="text-xl">{featured.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              {when(featured.date, featured.time)}
            </p>
            <p className="flex items-center gap-2">
              <MapPinIcon className="size-4 text-muted-foreground" />
              {featured.place}
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/${locale}/assemblies/${featured.id}`} className={buttonVariants()}>
              {labels.open}
            </Link>
          </CardFooter>
        </Card>
        {previous.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{labels.previous}</h2>
            <ul className="divide-y rounded-xl border">
              {previous.map((assembly) => (
                <li key={assembly.id}>
                  <Link
                    href={`/${locale}/assemblies/${assembly.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2 font-medium">
                        {assembly.name}
                        {assembly.kind && <Badge variant="outline">{assembly.kind.toLowerCase()}</Badge>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {when(assembly.date, assembly.time)} · {assembly.place}
                      </span>
                    </div>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}

export default AssembliesPage

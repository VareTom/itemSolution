import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, MapPinIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { AgendaItem } from '@/lib/parsers/assemblies.parser'
import { getAssembly } from '@/lib/services/assemblies.service'
import type { CatalogDocument } from '@/lib/services/document-catalog'
import { cn } from '@/lib/utils'

const ASSEMBLY_ID_PATTERN = /^\d+$/
const NOTE_BULLET_SEPARATOR = /\s+-\s+/

type DocumentLinkProps = {
  label: string
  document: CatalogDocument
  href: string
}

const DocumentLink = ({ label, document, href }: DocumentLinkProps) => (
  <Link href={href} className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
    <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
    <span className="flex min-w-0 flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{document.title}</span>
    </span>
  </Link>
)

type AgendaListProps = {
  items: AgendaItem[]
  labels: Dictionary['assemblies']['agenda']
}

const AgendaList = ({ items, labels }: AgendaListProps) => (
  <ol className="flex flex-col divide-y">
    {items.map((item, index) => {
      const bullets = item.note?.split(NOTE_BULLET_SEPARATOR).map((bullet) => bullet.replace(/^-\s*/, '')).filter(Boolean)
      return (
        <li key={item.id} className="flex gap-4 py-3">
          <span className="w-6 shrink-0 text-right text-sm text-muted-foreground tabular-nums">{index + 1}.</span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{item.title}</p>
            {item.proposedBy && (
              <p className="text-xs text-muted-foreground">{interpolate(labels.proposedBy, { name: item.proposedBy })}</p>
            )}
            {bullets && bullets.length > 0 && (
              <ul className="ml-4 list-disc text-sm text-muted-foreground">
                {bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      )
    })}
  </ol>
)

const AssemblyPage = async ({ params }: PageProps<'/[locale]/assemblies/[assemblyId]'>) => {
  const { assemblyId } = await params
  if (!ASSEMBLY_ID_PATTERN.test(assemblyId)) notFound()

  const [{ locale, t, format }, { assembly, documents }] = await Promise.all([getI18n(), getAssembly(assemblyId)])
  const labels = t.assemblies
  const previewHref = (documentId: string) => `/${locale}/documents?preview=${documentId}`
  const agenda = assembly.agenda.filter((item) => item.status === 'on_agenda')
  const rejected = assembly.agenda.filter((item) => item.status === 'rejected')
  const linkedDocuments = [
    ...documents.minutes.map((document) => ({ label: labels.documents.minutes, document })),
    ...(documents.convocation ? [{ label: labels.documents.convocation, document: documents.convocation }] : []),
    ...(documents.annexes ? [{ label: labels.documents.annexes, document: documents.annexes }] : []),
    ...documents.preparation.map((document) => ({ label: labels.documents.preparation, document })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/${locale}/assemblies`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}>
        <ArrowLeftIcon data-icon="inline-start" />
        {labels.back}
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{assembly.name}</h1>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-4">
          <span className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            {assembly.time
              ? interpolate(labels.when, { date: format.date(assembly.date), time: assembly.time })
              : format.date(assembly.date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPinIcon className="size-4" />
            {assembly.place}
          </span>
        </div>
        {assembly.convocationsSentAt && (
          <p className="text-xs text-muted-foreground">
            {interpolate(labels.convocationsSent, { date: format.date(assembly.convocationsSentAt) })}
          </p>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>{labels.agenda.title}</CardTitle>
            <CardDescription>{interpolate(labels.agenda.count, { count: agenda.length })}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <AgendaList items={agenda} labels={labels.agenda} />
            {rejected.length > 0 && (
              <Accordion>
                <AccordionItem value="rejected">
                  <AccordionTrigger>{interpolate(labels.agenda.rejected, { count: rejected.length })}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">{labels.agenda.rejectedHint}</p>
                    <AgendaList items={rejected} labels={labels.agenda} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
        <Card className="order-first h-fit lg:order-none">
          <CardHeader>
            <CardTitle>{labels.documents.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {linkedDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.documents.none}</p>
            ) : (
              linkedDocuments.map(({ label, document }) => (
                <DocumentLink key={document.id} label={label} document={document} href={previewHref(document.id)} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AssemblyPage

import Link from 'next/link'
import { DownloadIcon, SearchXIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import type { CatalogDocument } from '@/lib/services/document-catalog'
import { DocumentThumbnail } from './document-thumbnail'

type DocumentsTableProps = {
  documents: CatalogDocument[]
  previewHref: (documentId: string) => string
}

export const DocumentsTable = async ({ documents, previewHref }: DocumentsTableProps) => {
  const { t, format } = await getI18n()
  const labels = t.documents

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <SearchXIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">{labels.emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{labels.emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labels.columns.document}</TableHead>
            <TableHead className="hidden md:table-cell">{labels.columns.category}</TableHead>
            <TableHead className="hidden lg:table-cell">{labels.columns.fiscalYear}</TableHead>
            <TableHead className="hidden sm:table-cell">{labels.columns.date}</TableHead>
            <TableHead className="hidden text-right sm:table-cell">{labels.columns.size}</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">{t.common.download}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="max-w-md whitespace-normal">
                <Link href={previewHref(document.id)} scroll={false} className="group flex items-start gap-3">
                  <DocumentThumbnail documentId={document.id} />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium group-hover:underline">{document.title}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {document.reference}
                      <span className="tabular-nums sm:hidden">· {format.shortDate(document.date)}</span>
                      {document.scope === 'personal' && <Badge variant="secondary">{labels.personal}</Badge>}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{labels.categories[document.categoryId]}</Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{document.fiscalYear ?? '—'}</TableCell>
              <TableCell className="hidden tabular-nums text-muted-foreground sm:table-cell">{format.shortDate(document.date)}</TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {format.fileSize(document.sizeBytes)}
              </TableCell>
              <TableCell>
                <a
                  href={`/api/documents/${document.id}?download=1`}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                  aria-label={interpolate(labels.downloadDocument, { title: document.title })}
                >
                  <DownloadIcon />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

import Link from 'next/link'
import { DownloadIcon, FileTextIcon, SearchXIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatFileSize, formatShortDate } from '@/lib/format'
import { type CatalogDocument, DOCUMENT_CATEGORIES, OTHER_CATEGORY } from '@/lib/services/document-catalog'

const CATEGORY_LABELS = new Map<string, string>(
  [...DOCUMENT_CATEGORIES, OTHER_CATEGORY].map(({ id, label }) => [id, label]),
)

type DocumentsTableProps = {
  documents: CatalogDocument[]
  previewHref: (documentId: string) => string
}

export const DocumentsTable = ({ documents, previewHref }: DocumentsTableProps) => {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <SearchXIcon className="size-8 text-muted-foreground" />
        <p className="font-medium">Aucun document ne correspond</p>
        <p className="text-sm text-muted-foreground">Essayez d’autres mots-clés ou réinitialisez les filtres.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead className="hidden md:table-cell">Catégorie</TableHead>
            <TableHead className="hidden lg:table-cell">Exercice</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Taille</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Télécharger</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="max-w-md whitespace-normal">
                <Link href={previewHref(document.id)} scroll={false} className="group flex items-start gap-3">
                  <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium group-hover:underline">{document.title}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {document.reference}
                      {document.scope === 'personal' && <Badge variant="secondary">Personnel</Badge>}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{CATEGORY_LABELS.get(document.categoryId)}</Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">{document.fiscalYear ?? '—'}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{formatShortDate(document.date)}</TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatFileSize(document.sizeBytes)}
              </TableCell>
              <TableCell>
                <a
                  href={`/api/documents/${document.id}?download=1`}
                  className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
                  aria-label={`Télécharger ${document.title}`}
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

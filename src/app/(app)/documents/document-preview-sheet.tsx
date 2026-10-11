'use client'

import { DownloadIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatDate, formatFileSize } from '@/lib/format'
import type { CatalogDocument } from '@/lib/services/document-catalog'
import { documentsSearchParams } from './search-params'

type DocumentPreviewSheetProps = {
  document: CatalogDocument | null
}

export const DocumentPreviewSheet = ({ document }: DocumentPreviewSheetProps) => {
  const [documentId, setPreview] = useQueryState('preview', documentsSearchParams.preview)
  const shownDocument = document?.id === documentId ? document : null

  return (
    <Sheet open={documentId !== null} onOpenChange={(isOpen) => !isOpen && setPreview(null)}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-3xl">
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">{shownDocument?.title ?? 'Document'}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            {shownDocument ? (
              <>
                <span>{shownDocument.reference}</span>
                <span>·</span>
                <span>{formatDate(shownDocument.date)}</span>
                <span>·</span>
                <span>{formatFileSize(shownDocument.sizeBytes)}</span>
                <Badge variant="outline">{shownDocument.folderName}</Badge>
              </>
            ) : (
              'Aperçu du document'
            )}
          </SheetDescription>
        </SheetHeader>
        {documentId && (
          <iframe
            key={documentId}
            src={`/api/documents/${documentId}`}
            title={shownDocument?.title ?? 'Aperçu du document'}
            className="min-h-0 w-full flex-1 bg-muted"
          />
        )}
        <SheetFooter className="border-t">
          <a
            href={`/api/documents/${documentId}?download=1`}
            className={buttonVariants({ variant: 'default' })}
          >
            <DownloadIcon data-icon="inline-start" />
            Télécharger
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

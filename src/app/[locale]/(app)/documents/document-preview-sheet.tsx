'use client'

import { DownloadIcon, ExternalLinkIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createFormatters } from '@/lib/format'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'
import type { CatalogDocument } from '@/lib/services/document-catalog'
import { documentsSearchParams } from './search-params'

type DocumentPreviewSheetProps = {
  document: CatalogDocument | null
  locale: Locale
  labels: Dictionary['documents']['preview']
  downloadLabel: string
  openLabel: string
}

export const DocumentPreviewSheet = ({ document, locale, labels, downloadLabel, openLabel }: DocumentPreviewSheetProps) => {
  const [documentId, setPreview] = useQueryState('preview', documentsSearchParams.preview)
  const shownDocument = document?.id === documentId ? document : null
  const format = createFormatters(locale)

  return (
    <Sheet open={documentId !== null} onOpenChange={(isOpen) => !isOpen && setPreview(null)}>
      <SheetContent side="right" className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
        <SheetHeader className="border-b">
          <SheetTitle className="pr-8">{shownDocument?.title ?? labels.fallbackTitle}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            {shownDocument ? (
              <>
                <span>{shownDocument.reference}</span>
                <span>·</span>
                <span>{format.date(shownDocument.date)}</span>
                <span>·</span>
                <span>{format.fileSize(shownDocument.sizeBytes)}</span>
                <Badge variant="outline">{shownDocument.folderName}</Badge>
              </>
            ) : (
              labels.description
            )}
          </SheetDescription>
        </SheetHeader>
        {documentId && (
          <iframe
            key={documentId}
            src={`/api/documents/${documentId}`}
            title={shownDocument?.title ?? labels.description}
            className="min-h-0 w-full flex-1 bg-muted"
          />
        )}
        <SheetFooter className="grid grid-cols-2 gap-2 border-t">
          <a
            href={`/api/documents/${documentId}`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline' })}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            {openLabel}
          </a>
          <a href={`/api/documents/${documentId}?download=1`} className={buttonVariants({ variant: 'default' })}>
            <DownloadIcon data-icon="inline-start" />
            {downloadLabel}
          </a>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'

type DocumentsPaginationProps = {
  page: number
  pageCount: number
  total: number
  pageHref: (page: number) => string
}

export const DocumentsPagination = async ({ page, pageCount, total, pageHref }: DocumentsPaginationProps) => {
  const { t } = await getI18n()
  const labels = t.documents.pagination

  return (
    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
      <p className="text-sm text-muted-foreground">{interpolate(labels.summary, { total, page, pageCount })}</p>
      {pageCount > 1 && (
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={pageHref(page - 1)} text={labels.previous} aria-label={labels.previousLabel} />
              </PaginationItem>
            )}
            {page < pageCount && (
              <PaginationItem>
                <PaginationNext href={pageHref(page + 1)} text={labels.next} aria-label={labels.nextLabel} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

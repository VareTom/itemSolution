import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type DocumentsPaginationProps = {
  page: number
  pageCount: number
  total: number
  pageHref: (page: number) => string
}

export const DocumentsPagination = ({ page, pageCount, total, pageHref }: DocumentsPaginationProps) => (
  <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
    <p className="text-sm text-muted-foreground">
      {total} document{total > 1 ? 's' : ''} · page {page} sur {pageCount}
    </p>
    {pageCount > 1 && (
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious href={pageHref(page - 1)} text="Précédent" aria-label="Page précédente" />
            </PaginationItem>
          )}
          {page < pageCount && (
            <PaginationItem>
              <PaginationNext href={pageHref(page + 1)} text="Suivant" aria-label="Page suivante" />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    )}
  </div>
)

import { createSearchParamsCache } from 'nuqs/server'
import { PageHeader } from '@/components/page-header'
import { filterDocuments, listFiscalYears } from '@/lib/services/document-catalog'
import { getDocumentCatalog } from '@/lib/services/documents.service'
import { DocumentPreviewSheet } from './document-preview-sheet'
import { DocumentsPagination } from './documents-pagination'
import { DocumentsTable } from './documents-table'
import { DocumentsToolbar } from './documents-toolbar'
import { documentsSearchParams, serializeDocumentsSearchParams } from './search-params'

const PAGE_SIZE = 20

const searchParamsCache = createSearchParamsCache(documentsSearchParams)

const DocumentsPage = async ({ searchParams }: PageProps<'/documents'>) => {
  const filters = searchParamsCache.parse(await searchParams)
  const catalog = await getDocumentCatalog()
  const result = filterDocuments(catalog, {
    query: filters.q,
    category: filters.category,
    year: filters.year,
    scope: filters.scope,
    page: filters.page,
    pageSize: PAGE_SIZE,
  })

  const hrefWith = (changes: Partial<typeof filters>) =>
    `/documents${serializeDocumentsSearchParams({ ...filters, ...changes })}`

  return (
    <>
      <PageHeader title="Documents" description={`${catalog.length} documents de la copropriété, au même endroit.`} />
      <div className="flex flex-col gap-4">
        <DocumentsToolbar fiscalYears={listFiscalYears(catalog)} />
        <DocumentsTable documents={result.documents} previewHref={(id) => hrefWith({ preview: id })} />
        <DocumentsPagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageHref={(page) => hrefWith({ page, preview: null })}
        />
      </div>
      <DocumentPreviewSheet
        document={catalog.find((document) => document.id === filters.preview) ?? null}
      />
    </>
  )
}

export default DocumentsPage

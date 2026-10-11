import 'server-only'
import { cache } from 'react'
import { parseDocuments } from '@/lib/parsers/documents.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'
import { toCatalogDocument } from './document-catalog'

export const getDocumentCatalog = cache(async () =>
  parseDocuments(await fetchUpstreamHtml('/docs/ilist')).map(toCatalogDocument),
)

import type { UpstreamDocument } from '@/lib/parsers/documents.parser'

export const DOCUMENT_CATEGORIES = [
  { id: 'statements', label: 'Décomptes individuels', pattern: /décomptes? individuel/i },
  { id: 'assemblies', label: 'Assemblées générales', pattern: /as+embl|\bag\b/i },
  { id: 'invoices', label: 'Factures', pattern: /factur/i },
  { id: 'bank', label: 'Extraits bancaires', pattern: /extrait/i },
  { id: 'accounting', label: 'Comptabilité', pattern: /comptab|impression/i },
  { id: 'regulations', label: 'Acte de base & règlements', pattern: /acte de base|règlement|codes d'accès/i },
  { id: 'mail', label: 'Courriers', pattern: /courrier/i },
  {
    id: 'works',
    label: 'Travaux, contrats & rapports',
    pattern: /travaux|offre|devis|ascenseur|inspection|rapport|certificat|contrat|assurance|photo|etang/i,
  },
] as const

export const OTHER_CATEGORY = { id: 'other', label: 'Divers' } as const

export type DocumentCategoryId = (typeof DOCUMENT_CATEGORIES)[number]['id'] | typeof OTHER_CATEGORY.id
export type DocumentScope = 'personal' | 'shared'

export type CatalogDocument = UpstreamDocument & {
  categoryId: DocumentCategoryId
  fiscalYear: string | null
  scope: DocumentScope
}

const FISCAL_YEAR_PATTERN = /(20\d{2})\s*[-/]\s*(20\d{2})/
const PERSONAL_REFERENCE_PREFIX = 'CIS'

export const categorize = (folderName: string): DocumentCategoryId =>
  DOCUMENT_CATEGORIES.find(({ pattern }) => pattern.test(folderName))?.id ?? OTHER_CATEGORY.id

/** Extracts the accounting year from folder names such as "0312 - Factures 2023/2024" → "2023-2024". */
export const extractFiscalYear = (folderName: string) => {
  const match = folderName.match(FISCAL_YEAR_PATTERN)
  return match ? `${match[1]}-${match[2]}` : null
}

export const toCatalogDocument = (document: UpstreamDocument): CatalogDocument => ({
  ...document,
  categoryId: categorize(document.folderName),
  fiscalYear: extractFiscalYear(document.folderName),
  scope: document.reference.startsWith(PERSONAL_REFERENCE_PREFIX) ? 'personal' : 'shared',
})

export type DocumentFilters = {
  query: string
  category: DocumentCategoryId | null
  year: string | null
  scope: DocumentScope | null
  page: number
  pageSize: number
}

const normalizeForSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const matchesQuery = (document: CatalogDocument, query: string) => {
  const terms = normalizeForSearch(query).split(/\s+/).filter(Boolean)
  const haystack = normalizeForSearch(`${document.title} ${document.reference} ${document.folderName}`)
  return terms.every((term) => haystack.includes(term))
}

export const filterDocuments = (documents: CatalogDocument[], filters: DocumentFilters) => {
  const matching = documents
    .filter((document) => !filters.category || document.categoryId === filters.category)
    .filter((document) => !filters.year || document.fiscalYear === filters.year)
    .filter((document) => !filters.scope || document.scope === filters.scope)
    .filter((document) => matchesQuery(document, filters.query))
    .toSorted((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id))

  const pageCount = Math.max(1, Math.ceil(matching.length / filters.pageSize))
  const page = Math.min(Math.max(filters.page, 1), pageCount)

  return {
    documents: matching.slice((page - 1) * filters.pageSize, page * filters.pageSize),
    total: matching.length,
    page,
    pageCount,
  }
}

export const listFiscalYears = (documents: CatalogDocument[]) =>
  [...new Set(documents.map((document) => document.fiscalYear).filter((year) => year !== null))].toSorted().toReversed()

import { describe, expect, it } from 'bun:test'
import { type CatalogDocument, categorize, extractFiscalYear, filterDocuments, toCatalogDocument } from './document-catalog'

const document = (overrides: Partial<CatalogDocument>): CatalogDocument => ({
  id: '1',
  title: 'Document',
  reference: 'DIS1',
  folderId: '10',
  folderName: 'Divers',
  date: '2026-01-01',
  sizeBytes: 1024,
  fileType: 'pdf',
  categoryId: 'other',
  fiscalYear: null,
  scope: 'shared',
  ...overrides,
})

const DEFAULT_FILTERS = { query: '', category: null, year: null, scope: null, page: 1, pageSize: 10 }

const CATALOG = [
  document({ id: '1', title: 'Facture ascenseur Kone', categoryId: 'invoices', fiscalYear: '2025-2026', date: '2025-09-01' }),
  document({ id: '2', title: 'Facture électricité', categoryId: 'invoices', fiscalYear: '2024-2025', date: '2024-09-01' }),
  document({ id: '3', title: 'Appel de fonds', reference: 'CIS3', categoryId: 'statements', scope: 'personal', date: '2026-10-05' }),
]

describe('categorize', () => {
  it('should map an assembly folder to assemblies when the upstream name contains a typo', () => {
    expect(categorize('021-Asssemblée Générale Convocation')).toBe('assemblies')
  })

  it('should map a folder to other when no category rule matches', () => {
    expect(categorize('Divers')).toBe('other')
  })
})

describe('extractFiscalYear', () => {
  it('should normalize the fiscal year when the folder uses a slash with spaces', () => {
    expect(extractFiscalYear('0332 Extraits bancaires 2024 / 2025 Fonds de roulement')).toBe('2024-2025')
  })

  it('should return null when the folder has no fiscal year', () => {
    expect(extractFiscalYear('Préparation AG 12/10/2024')).toBeNull()
  })
})

describe('toCatalogDocument', () => {
  it('should mark a document as personal when its reference starts with CIS', () => {
    const upstream = { ...document({}), reference: 'CIS1085853', folderName: '042-Décomptes individuels' }

    expect(toCatalogDocument(upstream)).toMatchObject({ scope: 'personal', categoryId: 'statements', fiscalYear: null })
  })
})

describe('filterDocuments', () => {
  it('should return documents newest first when no filter is set', () => {
    expect(filterDocuments(CATALOG, DEFAULT_FILTERS).documents.map(({ id }) => id)).toEqual(['3', '1', '2'])
  })

  it('should match the query without accents and in any order when searching several words', () => {
    const result = filterDocuments(CATALOG, { ...DEFAULT_FILTERS, query: 'electricite facture' })

    expect(result.documents.map(({ id }) => id)).toEqual(['2'])
  })

  it('should combine category and fiscal year when both filters are set', () => {
    const result = filterDocuments(CATALOG, { ...DEFAULT_FILTERS, category: 'invoices', year: '2025-2026' })

    expect(result.documents.map(({ id }) => id)).toEqual(['1'])
  })

  it('should return only personal documents when the scope is personal', () => {
    expect(filterDocuments(CATALOG, { ...DEFAULT_FILTERS, scope: 'personal' }).total).toBe(1)
  })

  it('should clamp the page to the last page when the requested page is out of range', () => {
    const result = filterDocuments(CATALOG, { ...DEFAULT_FILTERS, page: 9, pageSize: 2 })

    expect(result).toMatchObject({ page: 2, pageCount: 2, total: 3 })
    expect(result.documents.map(({ id }) => id)).toEqual(['2'])
  })
})

import { describe, expect, it } from 'bun:test'
import { findAssemblyDocuments } from './assembly-documents'
import type { CatalogDocument } from './document-catalog'

const document = (id: string, title: string, folderName: string, date = '2025-10-01'): CatalogDocument => ({
  id,
  title,
  reference: `DIS${id}`,
  folderId: '1',
  folderName,
  date,
  sizeBytes: 1024,
  fileType: 'pdf',
  categoryId: 'assemblies',
  fiscalYear: null,
  scope: 'shared',
})

const ASSEMBLY = { name: 'Assemblée Générale 2025 - MONDRIAN-KANDINSKY', date: '2025-10-11', annexesDocumentId: '20' }

const DOCUMENTS = [
  document('10', 'Convocation - Assemblée Générale 2025 - MONDRIAN-KANDINSKY', '021-Asssemblée Générale Convocation'),
  document('11', 'Convocation - Assemblée Générale 2024 - MONDRIAN-KANDINSKY', '021-Asssemblée Générale Convocation'),
  document('20', 'Assemblée Générale 2025 - MONDRIAN-KANDINSKY', '022-Assemblée Générale annexe'),
  document('30', 'PV AG 11-10-2025_MDR-KDS', '02-Assemblée générale', '2025-10-17'),
  document('31', 'PV AG 09-10-2025_ Etang-abords CDA', '21. Etang et abords communs CDA'),
  document('32', 'PV AG 12.10.2024_MDR-KDS', 'Préparation AG 12/10/2024'),
  document('40', 'RAPPORT ANNUEL 2025 DU CDC', 'Préparation AG 2025', '2025-09-26'),
  document('41', 'Budget 2024-2025', 'Préparation AG 12/10/2024'),
]

describe('findAssemblyDocuments', () => {
  it('should pick the convocation whose title carries the assembly name', () => {
    expect(findAssemblyDocuments({ assembly: ASSEMBLY, documents: DOCUMENTS }).convocation?.id).toBe('10')
  })

  it('should pick the annexes bundle linked from the assembly page', () => {
    expect(findAssemblyDocuments({ assembly: ASSEMBLY, documents: DOCUMENTS }).annexes?.id).toBe('20')
  })

  it('should keep only the minutes dated on the assembly day when other assemblies happened the same week', () => {
    expect(findAssemblyDocuments({ assembly: ASSEMBLY, documents: DOCUMENTS }).minutes.map(({ id }) => id)).toEqual(['30'])
  })

  it('should match minutes written with dots when the title uses another date separator', () => {
    const assembly = { ...ASSEMBLY, date: '2024-10-12', annexesDocumentId: null }

    expect(findAssemblyDocuments({ assembly, documents: DOCUMENTS }).minutes.map(({ id }) => id)).toEqual(['32'])
  })

  it('should list preparation documents from the folder of the assembly year', () => {
    expect(findAssemblyDocuments({ assembly: ASSEMBLY, documents: DOCUMENTS }).preparation.map(({ id }) => id)).toEqual(['40'])
  })

  it('should return empty results when no document matches the assembly', () => {
    const assembly = { name: 'AG extraordinaire', date: '2030-01-15', annexesDocumentId: null }

    expect(findAssemblyDocuments({ assembly, documents: DOCUMENTS })).toEqual({
      convocation: null,
      annexes: null,
      minutes: [],
      preparation: [],
    })
  })
})

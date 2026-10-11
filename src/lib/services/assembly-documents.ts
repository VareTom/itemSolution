import type { Assembly } from '@/lib/parsers/assemblies.parser'
import type { CatalogDocument } from './document-catalog'

const CONVOCATION_FOLDER_PATTERN = /convocation/i
const PREPARATION_FOLDER_PATTERN = /pr[ée]paration\s+ag/i
const MINUTES_TITLE_PATTERN = /\bPV\s*AG\b/i

export type AssemblyDocuments = {
  convocation: CatalogDocument | null
  annexes: CatalogDocument | null
  minutes: CatalogDocument[]
  preparation: CatalogDocument[]
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()

/** "2025-10-11" → the spellings used in upstream titles: "11-10-2025", "11.10.2025", "11/10/2025". */
const dateSpellings = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-')
  return ['-', '.', '/'].map((separator) => [day, month, year].join(separator))
}

const byNewest = (a: CatalogDocument, b: CatalogDocument) => b.date.localeCompare(a.date)

type FindAssemblyDocumentsInput = {
  assembly: Pick<Assembly, 'name' | 'date' | 'annexesDocumentId'>
  documents: CatalogDocument[]
}

/**
 * Upstream does not expose which documents belong to an assembly to co-owners,
 * so they are matched from the document catalog by folder, title and date.
 */
export const findAssemblyDocuments = ({ assembly, documents }: FindAssemblyDocumentsInput): AssemblyDocuments => {
  const assemblyName = normalize(assembly.name)
  const assemblyYear = assembly.date.slice(0, 4)
  const spellings = dateSpellings(assembly.date)

  return {
    convocation:
      documents
        .filter((document) => CONVOCATION_FOLDER_PATTERN.test(document.folderName))
        .filter((document) => normalize(document.title).includes(assemblyName))
        .toSorted(byNewest)[0] ?? null,
    annexes: documents.find((document) => document.id === assembly.annexesDocumentId) ?? null,
    minutes: documents
      .filter((document) => MINUTES_TITLE_PATTERN.test(document.title))
      .filter((document) => spellings.some((spelling) => document.title.includes(spelling)))
      .toSorted(byNewest),
    preparation: documents
      .filter((document) => PREPARATION_FOLDER_PATTERN.test(document.folderName))
      .filter((document) => document.folderName.includes(assemblyYear))
      .toSorted(byNewest),
  }
}

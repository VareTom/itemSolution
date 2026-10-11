import 'server-only'
import { parseAssembly, parseAssemblyList } from '@/lib/parsers/assemblies.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'
import { findAssemblyDocuments } from './assembly-documents'
import { getDocumentCatalog } from './documents.service'

export const getAssemblies = async () => parseAssemblyList(await fetchUpstreamHtml('/assemblies/'))

export const getAssembly = async (assemblyId: string) => {
  const [html, documents] = await Promise.all([fetchUpstreamHtml(`/assemblies/view/${assemblyId}`), getDocumentCatalog()])
  const assembly = parseAssembly(html, assemblyId)
  return { assembly, documents: findAssemblyDocuments({ assembly, documents }) }
}

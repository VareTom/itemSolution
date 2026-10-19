import 'server-only'
import { parseLotDetails, parseRegistry } from '@/lib/parsers/registry.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'

const ALL_LOTS_TAB = 0

export const getRegistry = async () => parseRegistry(await fetchUpstreamHtml(`/registries/index/${ALL_LOTS_TAB}`))

export const getLot = async (lotId: string) => {
  const [html, registry] = await Promise.all([
    fetchUpstreamHtml(`/registries/view_registry/registry-${lotId}`),
    getRegistry(),
  ])
  const lot = registry.find(({ id }) => id === lotId)
  return lot ? { lot, details: parseLotDetails(html) } : null
}

import 'server-only'
import { parseResidence } from '@/lib/parsers/residence.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'

export const getResidence = async () => parseResidence(await fetchUpstreamHtml('/'))

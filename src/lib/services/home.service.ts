import 'server-only'
import { parseBankDetails } from '@/lib/parsers/bank-details.parser'
import { parseResidence, parseResidenceContact } from '@/lib/parsers/residence.parser'
import { parseHomeNotices, parseWall } from '@/lib/parsers/wall.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'

export const getHome = async () => {
  const html = await fetchUpstreamHtml('/')
  return {
    residence: parseResidence(html),
    contact: parseResidenceContact(html),
    bankDetails: parseBankDetails(html),
    wall: parseWall(html),
    notices: parseHomeNotices(html, '[id^="block-administrator"]'),
    events: parseHomeNotices(html, '[id^="block-calandar"]'),
  }
}

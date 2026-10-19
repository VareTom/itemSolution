import 'server-only'
import { parseContact, parseDirectory } from '@/lib/parsers/directory.parser'
import { fetchUpstreamHtml } from '@/lib/upstream/upstream-client'
import { DIRECTORY_GROUP_TABS, type DirectoryGroup } from './directory-catalog'
import { lotsOwnedBy } from './registry-catalog'
import { getRegistry } from './registry.service'

export const getDirectory = async (group: DirectoryGroup) =>
  parseDirectory(await fetchUpstreamHtml(`/directories/index/${DIRECTORY_GROUP_TABS[group]}`))

export const getContact = async (contactId: string) => {
  const [html, registry] = await Promise.all([
    fetchUpstreamHtml(`/directories/view_contact/contact-${contactId}`),
    getRegistry(),
  ])
  const contact = parseContact(html, contactId)
  return contact && { contact, ownedLots: lotsOwnedBy(registry, contactId) }
}

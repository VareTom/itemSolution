import { parseAsString, parseAsStringLiteral } from 'nuqs/server'
import { DIRECTORY_GROUPS, type DirectoryGroup } from '@/lib/services/directory-catalog'

export const directorySearchParams = {
  q: parseAsString.withDefault(''),
  group: parseAsStringLiteral(DIRECTORY_GROUPS).withDefault('owners'),
}

export const isDirectoryGroup = (value: string): value is DirectoryGroup =>
  DIRECTORY_GROUPS.some((group) => group === value)

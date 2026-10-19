import type { DirectoryEntry } from '@/lib/parsers/directory.parser'
import { matchesSearch, normalizeForSearch } from '@/lib/search'

/** Upstream tab id of each directory group (/directories/index/:tab). */
export const DIRECTORY_GROUP_TABS = {
  owners: 1,
  council: 2,
  residents: 3,
  nonResidents: 4,
  occupants: 5,
  suppliers: 10,
  formerOwners: 13,
  formerOccupants: 14,
} as const

export type DirectoryGroup = keyof typeof DIRECTORY_GROUP_TABS
export const DIRECTORY_GROUPS = Object.keys(DIRECTORY_GROUP_TABS) as DirectoryGroup[]

const NON_LETTER_INITIAL = '#'

const initialOf = (name: string) => {
  const initial = normalizeForSearch(name).charAt(0).toUpperCase()
  return /[A-Z]/.test(initial) ? initial : NON_LETTER_INITIAL
}

export type DirectorySection = { initial: string; entries: DirectoryEntry[] }

/** Filters the directory and splits it into alphabetical sections, whatever the case upstream used. */
export const groupDirectory = (entries: DirectoryEntry[], query: string): DirectorySection[] => {
  const matching = entries
    .filter((entry) => matchesSearch(query, entry.name))
    .toSorted((first, second) => normalizeForSearch(first.name).localeCompare(normalizeForSearch(second.name)))

  return Object.entries(Object.groupBy(matching, (entry) => initialOf(entry.name))).map(([initial, sectionEntries]) => ({
    initial,
    entries: sectionEntries ?? [],
  }))
}

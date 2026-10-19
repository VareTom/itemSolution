/** Lowercases and strips accents so "Liège" matches "liege". */
export const normalizeForSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** True when every word of the query appears somewhere in the searchable text. */
export const matchesSearch = (query: string, searchableText: string) => {
  const haystack = normalizeForSearch(searchableText)
  return normalizeForSearch(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

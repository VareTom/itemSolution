const BELGIAN_DATE_PATTERN = /(\d{2})\/(\d{2})\/(\d{4})/

/** Parses upstream amounts such as "1768.39", "-100.00" or "1 234,56". */
export const parseAmount = (raw: string) => {
  const normalized = raw.replace(/[\s €]/g, '').replace(',', '.')
  const amount = Number(normalized)
  if (normalized === '' || Number.isNaN(amount)) throw new Error(`Unparsable amount: "${raw}"`)
  return amount
}

/** Parses "dd/mm/yyyy" (optionally followed by a time) into an ISO date "yyyy-mm-dd". */
export const parseBelgianDate = (raw: string) => {
  const match = raw.match(BELGIAN_DATE_PATTERN)
  if (!match) throw new Error(`Unparsable date: "${raw}"`)
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

export const cleanText = (raw: string) => raw.replace(/\s+/g, ' ').trim()

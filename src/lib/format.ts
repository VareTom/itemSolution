const LOCALE = 'fr-BE'

const euroFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR' })
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
const sizeFormatter = new Intl.NumberFormat(LOCALE, { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 0 })
const megabyteFormatter = new Intl.NumberFormat(LOCALE, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 })

const BYTES_PER_KILOBYTE = 1024
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE

export const formatEuro = (amount: number) => euroFormatter.format(amount)

/** Formats an ISO date ("2026-10-05") as "5 octobre 2026". */
export const formatDate = (isoDate: string) => dateFormatter.format(new Date(isoDate))

export const formatShortDate = (isoDate: string) => shortDateFormatter.format(new Date(isoDate))

export const formatFileSize = (bytes: number) =>
  bytes >= BYTES_PER_MEGABYTE
    ? megabyteFormatter.format(bytes / BYTES_PER_MEGABYTE)
    : sizeFormatter.format(Math.max(1, Math.round(bytes / BYTES_PER_KILOBYTE)))

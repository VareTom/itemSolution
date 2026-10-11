import { INTL_LOCALES, type Locale } from '@/lib/i18n/locales'

const BYTES_PER_KILOBYTE = 1024
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE
const ISO_DATE_LENGTH = 10

/** Upstream dates are Brussels wall-clock values: pin them to UTC and format in UTC so they are shown unchanged. */
const toUtcWallTime = (isoValue: string) =>
  new Date(isoValue.length === ISO_DATE_LENGTH ? `${isoValue}T00:00:00Z` : `${isoValue}:00Z`)

export type Formatters = ReturnType<typeof createFormatters>

export const createFormatters = (locale: Locale) => {
  const intlLocale = INTL_LOCALES[locale]
  const euro = new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'EUR' })
  const longDate = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const shortDate = new Intl.DateTimeFormat(intlLocale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
  const dateTime = new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
  const kilobytes = new Intl.NumberFormat(intlLocale, { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 0 })
  const megabytes = new Intl.NumberFormat(intlLocale, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 })

  return {
    euro: (amount: number) => euro.format(amount),
    /** Formats an ISO date ("2026-10-05", time ignored) as "5 octobre 2026". */
    date: (isoDate: string) => longDate.format(toUtcWallTime(isoDate.slice(0, ISO_DATE_LENGTH))),
    shortDate: (isoDate: string) => shortDate.format(toUtcWallTime(isoDate.slice(0, ISO_DATE_LENGTH))),
    /** Formats a local wall-clock ISO date-time ("2025-09-29T21:35") without shifting it to another time zone. */
    dateTime: (isoDateTime: string) => dateTime.format(toUtcWallTime(isoDateTime)),
    fileSize: (bytes: number) =>
      bytes >= BYTES_PER_MEGABYTE
        ? megabytes.format(bytes / BYTES_PER_MEGABYTE)
        : kilobytes.format(Math.max(1, Math.round(bytes / BYTES_PER_KILOBYTE))),
  }
}

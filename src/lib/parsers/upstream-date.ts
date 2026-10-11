const BELGIAN_DATE_PATTERN = /(\d{2})\/(\d{2})\/(\d{4})/
const WRITTEN_DATE_PATTERN = /(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/
const TIME_PATTERN = /(\d{1,2}):(\d{2})/
const BRUSSELS_TIME_ZONE = 'Europe/Brussels'
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12,
}

const RELATIVE_DAY_OFFSETS: Record<string, number> = {
  "aujourd'hui": 0,
  hier: -1,
  demain: 1,
}

const pad = (value: number | string) => String(value).padStart(2, '0')

/** Today's date in Brussels as "yyyy-mm-dd", the reference the upstream site uses for "Hier" or "Demain". */
export const brusselsToday = (now: Date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BRUSSELS_TIME_ZONE }).format(now)

const shiftIsoDate = (isoDate: string, days: number) =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * MILLISECONDS_PER_DAY).toISOString().slice(0, 10)

const parseDatePart = (raw: string, today: string) => {
  const belgian = raw.match(BELGIAN_DATE_PATTERN)
  if (belgian) return `${belgian[3]}-${belgian[2]}-${belgian[1]}`

  const written = raw.match(WRITTEN_DATE_PATTERN)
  const month = written && MONTHS[written[2].toLowerCase()]
  if (written && month) return `${written[3]}-${pad(month)}-${pad(written[1])}`

  const relativeKey = Object.keys(RELATIVE_DAY_OFFSETS).find((key) => raw.toLowerCase().replace('’', "'").includes(key))
  if (relativeKey) return shiftIsoDate(today, RELATIVE_DAY_OFFSETS[relativeKey])

  throw new Error(`Unparsable date: "${raw}"`)
}

/**
 * Parses the date formats used across the upstream site into an ISO local date ("yyyy-mm-dd"):
 * "03/10/2025", "29 September 2025", "Hier", "Aujourd'hui".
 */
export const parseUpstreamDate = (raw: string, today: string = brusselsToday()) => parseDatePart(raw, today)

/** Same as parseUpstreamDate but keeps the time when present: "yyyy-mm-ddThh:mm". */
export const parseUpstreamDateTime = (raw: string, today: string = brusselsToday()) => {
  const date = parseDatePart(raw, today)
  const time = raw.match(TIME_PATTERN)
  return time ? `${date}T${pad(time[1])}:${time[2]}` : `${date}T00:00`
}

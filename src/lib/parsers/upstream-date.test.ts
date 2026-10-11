import { describe, expect, it } from 'bun:test'
import { brusselsToday, parseUpstreamDate, parseUpstreamDateTime } from './upstream-date'

const TODAY = '2026-10-11'

describe('parseUpstreamDateTime', () => {
  it('should parse a numeric date with time when the upstream uses dd/mm/yyyy', () => {
    expect(parseUpstreamDateTime('03/10/2025 à 14:31', TODAY)).toBe('2025-10-03T14:31')
  })

  it('should parse an english written date when the upstream renders message dates', () => {
    expect(parseUpstreamDateTime(' 29 September 2025 à 21:35 ', TODAY)).toBe('2025-09-29T21:35')
  })

  it('should parse a french written date when the month is in french', () => {
    expect(parseUpstreamDateTime('5 août 2026 à 9:05', TODAY)).toBe('2026-08-05T09:05')
  })

  it('should resolve the day before today when the upstream says "Hier"', () => {
    expect(parseUpstreamDateTime('Hier', TODAY)).toBe('2026-10-10T00:00')
  })

  it('should resolve the next day across a month boundary when the upstream says "Demain"', () => {
    expect(parseUpstreamDate('Demain', '2026-10-31')).toBe('2026-11-01')
  })

  it('should throw when the value is not a date', () => {
    expect(() => parseUpstreamDate('bientôt', TODAY)).toThrow()
  })
})

describe('brusselsToday', () => {
  it('should return the next day in Brussels when it is already past midnight there', () => {
    expect(brusselsToday(new Date('2026-10-10T22:30:00Z'))).toBe('2026-10-11')
  })
})

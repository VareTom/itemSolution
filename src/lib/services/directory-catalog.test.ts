import { describe, expect, it } from 'bun:test'
import { groupDirectory } from './directory-catalog'

const ENTRIES = [
  { id: '1', name: 'Debbaut Didier' },
  { id: '2', name: 'DE BODT Marc' },
  { id: '3', name: 'ÉTIENNE Paul' },
  { id: '4', name: '44PROXIMUS' },
]

describe('groupDirectory', () => {
  it('should group names by unaccented initial when names mix case and accents', () => {
    expect(groupDirectory(ENTRIES, '').map(({ initial, entries }) => [initial, entries.map(({ id }) => id)])).toEqual([
      ['#', ['4']],
      ['D', ['2', '1']],
      ['E', ['3']],
    ])
  })

  it('should keep only matching names when searching without accents', () => {
    expect(groupDirectory(ENTRIES, 'etienne')).toEqual([{ initial: 'E', entries: [{ id: '3', name: 'ÉTIENNE Paul' }] }])
  })
})

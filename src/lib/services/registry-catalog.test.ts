import { describe, expect, it } from 'bun:test'
import type { Lot } from '@/lib/parsers/registry.parser'
import { countLotsByType, filterLots, lotsOwnedBy } from './registry-catalog'

const LOTS: Lot[] = [
  { id: '1', number: '07.1.2', type: 'apartment', typeLabel: 'Appartement', owners: [{ contactId: '11', name: 'DUPONT Alice' }] },
  { id: '2', number: '07.C11', type: 'cellar', typeLabel: 'Cave', owners: [{ contactId: '11', name: 'DUPONT Alice' }] },
  {
    id: '3',
    number: '06.0.1',
    type: 'apartment',
    typeLabel: 'Appartement',
    owners: [
      { contactId: '22', name: 'MARTIN Bob' },
      { contactId: '11', name: null },
    ],
  },
]

describe('filterLots', () => {
  it('should keep lots of the selected type when a type is chosen', () => {
    expect(filterLots(LOTS, { query: '', type: 'cellar' }).map(({ id }) => id)).toEqual(['2'])
  })

  it('should match the owner name and the lot number when searching', () => {
    expect(filterLots(LOTS, { query: 'martin 06', type: null }).map(({ id }) => id)).toEqual(['3'])
  })
})

describe('countLotsByType', () => {
  it('should leave out absent types when counting lots per type', () => {
    expect(countLotsByType(LOTS)).toEqual([
      { type: 'apartment', count: 2 },
      { type: 'cellar', count: 1 },
    ])
  })
})

describe('lotsOwnedBy', () => {
  it('should include lots owned jointly when the contact is a co-owner', () => {
    expect(lotsOwnedBy(LOTS, '11').map(({ id }) => id)).toEqual(['1', '2', '3'])
  })
})

import { LOT_TYPES, type Lot, type LotType } from '@/lib/parsers/registry.parser'
import { matchesSearch } from '@/lib/search'

type LotFilters = {
  query: string
  type: LotType | null
}

export const filterLots = (lots: Lot[], { query, type }: LotFilters) =>
  lots.filter(
    (lot) =>
      (type === null || lot.type === type) &&
      matchesSearch(query, `${lot.number} ${lot.owners.map(({ name }) => name ?? '').join(' ')}`),
  )

/** Lot types present in the residence with their number of lots, in a stable order. */
export const countLotsByType = (lots: Lot[]) =>
  LOT_TYPES.map((type) => ({ type, count: lots.filter((lot) => lot.type === type).length })).filter(
    ({ count }) => count > 0,
  )

/** Lots a contact owns, alone or with co-owners. */
export const lotsOwnedBy = (lots: Lot[], contactId: string) =>
  lots.filter((lot) => lot.owners.some((owner) => owner.contactId === contactId))

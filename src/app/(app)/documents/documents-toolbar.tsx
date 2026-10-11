'use client'

import { SearchIcon, XIcon } from 'lucide-react'
import { debounce, useQueryStates } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DOCUMENT_CATEGORIES, OTHER_CATEGORY } from '@/lib/services/document-catalog'
import { documentsSearchParams, isCategoryId, isScope } from './search-params'

const SEARCH_DEBOUNCE_MS = 300
const ALL = 'all'

const CATEGORY_ITEMS = [
  { value: ALL, label: 'Toutes les catégories' },
  ...[...DOCUMENT_CATEGORIES, OTHER_CATEGORY].map(({ id, label }) => ({ value: id, label })),
]

const SCOPE_ITEMS = [
  { value: ALL, label: 'Tous' },
  { value: 'personal', label: 'Les miens' },
  { value: 'shared', label: 'Collectifs' },
] as const

type DocumentsToolbarProps = {
  fiscalYears: string[]
}

export const DocumentsToolbar = ({ fiscalYears }: DocumentsToolbarProps) => {
  const [filters, setFilters] = useQueryStates(documentsSearchParams, { shallow: false })
  const yearItems = [{ value: ALL, label: 'Tous les exercices' }, ...fiscalYears.map((year) => ({ value: year, label: year }))]
  const hasFilters = Boolean(filters.q || filters.category || filters.year || filters.scope)

  const updateFilters = (changes: Partial<typeof filters>) => setFilters({ ...changes, page: null, preview: null })

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un document, une facture, une référence…"
          className="pl-8"
          value={filters.q}
          onChange={(event) =>
            setFilters(
              { q: event.target.value || null, page: null, preview: null },
              { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) },
            )
          }
          aria-label="Rechercher"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={CATEGORY_ITEMS}
          value={filters.category ?? ALL}
          onValueChange={(value) =>
            updateFilters({ category: value && isCategoryId(value) ? value : null })
          }
        >
          <SelectTrigger aria-label="Catégorie">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_ITEMS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={yearItems}
          value={filters.year ?? ALL}
          onValueChange={(value) => updateFilters({ year: value && value !== ALL ? value : null })}
        >
          <SelectTrigger aria-label="Exercice comptable">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearItems.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup
          variant="outline"
          spacing={0}
          value={[filters.scope ?? ALL]}
          onValueChange={([value]) =>
            updateFilters({ scope: value && isScope(value) ? value : null })
          }
          aria-label="Destinataire"
        >
          {SCOPE_ITEMS.map(({ value, label }) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => setFilters({ q: null, category: null, year: null, scope: null, page: null, preview: null })}
          >
            <XIcon data-icon="inline-start" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}

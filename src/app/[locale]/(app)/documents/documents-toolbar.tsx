'use client'

import { SearchIcon, XIcon } from 'lucide-react'
import { debounce, useQueryStates } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { CATEGORY_IDS, documentsSearchParams, isCategoryId, isScope } from './search-params'

const SEARCH_DEBOUNCE_MS = 300
const ALL = 'all'

type DocumentsToolbarProps = {
  fiscalYears: string[]
  labels: Dictionary['documents']
}

export const DocumentsToolbar = ({ fiscalYears, labels }: DocumentsToolbarProps) => {
  const [filters, setFilters] = useQueryStates(documentsSearchParams, { shallow: false })
  const categoryItems = [
    { value: ALL, label: labels.allCategories },
    ...CATEGORY_IDS.map((id) => ({ value: id, label: labels.categories[id] })),
  ]
  const yearItems = [
    { value: ALL, label: labels.allFiscalYears },
    ...fiscalYears.map((year) => ({ value: year, label: year })),
  ]
  const scopeItems = [
    { value: ALL, label: labels.scopes.all },
    { value: 'personal', label: labels.scopes.personal },
    { value: 'shared', label: labels.scopes.shared },
  ]
  const hasFilters = Boolean(filters.q || filters.category || filters.year || filters.scope)

  const updateFilters = (changes: Partial<typeof filters>) => setFilters({ ...changes, page: null, preview: null })

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={labels.searchPlaceholder}
          className="pl-8"
          value={filters.q}
          onChange={(event) =>
            setFilters(
              { q: event.target.value || null, page: null, preview: null },
              { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) },
            )
          }
          aria-label={labels.searchLabel}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={categoryItems}
          value={filters.category ?? ALL}
          onValueChange={(value) => updateFilters({ category: value && isCategoryId(value) ? value : null })}
        >
          <SelectTrigger aria-label={labels.categoryLabel}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map(({ value, label }) => (
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
          <SelectTrigger aria-label={labels.fiscalYearLabel}>
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
          onValueChange={([value]) => updateFilters({ scope: value && isScope(value) ? value : null })}
          aria-label={labels.scopeLabel}
        >
          {scopeItems.map(({ value, label }) => (
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
            {labels.reset}
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

import { SearchIcon } from 'lucide-react'
import { debounce, useQueryStates } from 'nuqs'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { TICKET_FILTERS } from '@/lib/services/ticket-catalog'
import { isTicketFilter, ticketsSearchParams } from './search-params'

const SEARCH_DEBOUNCE_MS = 300

type TicketsToolbarProps = {
  labels: Dictionary['tickets']
}

export const TicketsToolbar = ({ labels }: TicketsToolbarProps) => {
  const [{ q, filter }, setFilters] = useQueryStates(ticketsSearchParams, { shallow: false })

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchLabel}
          className="pl-8"
          value={q}
          onChange={(event) => setFilters({ q: event.target.value || null }, { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) })}
        />
      </div>
      <ToggleGroup
        variant="outline"
        spacing={0}
        value={[filter]}
        onValueChange={([value]) => setFilters({ filter: value && isTicketFilter(value) ? value : null })}
      >
        {TICKET_FILTERS.map((value) => (
          <ToggleGroupItem key={value} value={value}>
            {labels.filters[value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

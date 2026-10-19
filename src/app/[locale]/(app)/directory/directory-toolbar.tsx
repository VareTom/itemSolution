'use client'

import { SearchIcon } from 'lucide-react'
import { debounce, useQueryStates } from 'nuqs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { DIRECTORY_GROUPS } from '@/lib/services/directory-catalog'
import { directorySearchParams, isDirectoryGroup } from './search-params'

const SEARCH_DEBOUNCE_MS = 300

type DirectoryToolbarProps = {
  labels: Dictionary['directory']
}

export const DirectoryToolbar = ({ labels }: DirectoryToolbarProps) => {
  const [{ q, group }, setFilters] = useQueryStates(directorySearchParams, { shallow: false })
  const groupItems = DIRECTORY_GROUPS.map((value) => ({ value, label: labels.groups[value] }))

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
      <Select
        items={groupItems}
        value={group}
        onValueChange={(value) => setFilters({ group: value && isDirectoryGroup(value) ? value : null })}
      >
        <SelectTrigger aria-label={labels.groupLabel} className="w-full sm:w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {groupItems.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

import Link from 'next/link'
import { createSearchParamsCache } from 'nuqs/server'
import { ChevronRightIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { buttonVariants } from '@/components/ui/button'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import { countLotsByType, filterLots } from '@/lib/services/registry-catalog'
import { getRegistry } from '@/lib/services/registry.service'
import { cn } from '@/lib/utils'
import { RegistrySearch } from './registry-search'
import { registrySearchParams, serializeRegistrySearchParams } from './search-params'

const searchParamsCache = createSearchParamsCache(registrySearchParams)

type TypeFilterLinkProps = {
  href: string
  label: string
  count: number
  isActive: boolean
}

const TypeFilterLink = ({ href, label, count, isActive }: TypeFilterLinkProps) => (
  <Link
    href={href}
    aria-current={isActive ? 'page' : undefined}
    className={buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' })}
  >
    {label}
    <span className={cn('tabular-nums', isActive ? 'opacity-70' : 'text-muted-foreground')}>{count}</span>
  </Link>
)

const RegistryPage = async ({ searchParams }: PageProps<'/[locale]/registry'>) => {
  const filters = searchParamsCache.parse(await searchParams)
  const [{ locale, t, format }, lots] = await Promise.all([getI18n(), getRegistry()])
  const labels = t.registry
  const matching = filterLots(lots, { query: filters.q, type: filters.type })
  const typeHref = (type: typeof filters.type) =>
    `/${locale}/registry${serializeRegistrySearchParams({ q: filters.q || null, type })}`

  return (
    <>
      <PageHeader title={labels.title} description={interpolate(labels.description, { count: format.integer(lots.length) })} />
      <div className="flex flex-col gap-4">
        <RegistrySearch labels={labels} />
        <nav aria-label={labels.columns.type} className="flex flex-wrap gap-2">
          <TypeFilterLink href={typeHref(null)} label={labels.allTypes} count={lots.length} isActive={filters.type === null} />
          {countLotsByType(lots).map(({ type, count }) => (
            <TypeFilterLink
              key={type}
              href={typeHref(type)}
              label={labels.types[type]}
              count={count}
              isActive={filters.type === type}
            />
          ))}
        </nav>
        {matching.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {lots.length === 0 ? labels.empty : labels.noMatch}
          </p>
        ) : (
          <div className="rounded-xl border">
            <div className="hidden grid-cols-[7rem_11rem_1fr_1rem] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
              <span>{labels.columns.lot}</span>
              <span>{labels.columns.type}</span>
              <span>{labels.columns.owners}</span>
            </div>
            <ul className="divide-y">
              {matching.map((lot) => (
                <li key={lot.id}>
                  <Link
                    href={`/${locale}/registry/${lot.id}`}
                    className="grid grid-cols-[4.5rem_1fr_1rem] items-center gap-x-3 px-4 py-3 transition-colors hover:bg-muted/50 sm:grid-cols-[7rem_11rem_1fr_1rem] sm:gap-x-4"
                  >
                    <span className="text-sm font-medium tabular-nums">{lot.number}</span>
                    <span className="col-start-2 row-start-2 text-xs text-muted-foreground sm:col-start-auto sm:row-start-auto sm:text-sm">
                      {labels.type[lot.type]}
                    </span>
                    <span className="col-start-2 row-start-1 min-w-0 text-sm break-words sm:col-start-auto sm:row-start-auto">
                      {lot.owners.map(({ name }) => name ?? labels.lot.ownerFallback).join(', ')}
                    </span>
                    <ChevronRightIcon className="col-start-3 row-span-2 row-start-1 size-4 text-muted-foreground sm:col-start-auto sm:row-span-1 sm:row-start-auto" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

export default RegistryPage

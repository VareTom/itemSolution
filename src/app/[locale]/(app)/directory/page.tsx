import Link from 'next/link'
import { createSearchParamsCache } from 'nuqs/server'
import { ChevronRightIcon } from 'lucide-react'
import { ContactAvatar } from '@/components/contact-avatar'
import { PageHeader } from '@/components/page-header'
import { getI18n } from '@/lib/i18n/get-i18n'
import { interpolate } from '@/lib/i18n/locales'
import { groupDirectory } from '@/lib/services/directory-catalog'
import { getDirectory } from '@/lib/services/directory.service'
import { DirectoryToolbar } from './directory-toolbar'
import { directorySearchParams } from './search-params'

const searchParamsCache = createSearchParamsCache(directorySearchParams)

const DirectoryPage = async ({ searchParams }: PageProps<'/[locale]/directory'>) => {
  const { q, group } = searchParamsCache.parse(await searchParams)
  const [{ locale, t }, entries] = await Promise.all([getI18n(), getDirectory(group)])
  const labels = t.directory
  const sections = groupDirectory(entries, q)
  const matchCount = sections.reduce((total, section) => total + section.entries.length, 0)

  return (
    <>
      <PageHeader title={labels.title} description={labels.description} />
      <div className="flex flex-col gap-4">
        <DirectoryToolbar labels={labels} />
        {entries.length === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>
        )}
        {entries.length > 0 && matchCount === 0 && (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {interpolate(labels.noMatch, { query: q })}
          </p>
        )}
        {matchCount > 0 && (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{interpolate(labels.count, { count: String(matchCount) })}</p>
              {sections.length > 1 && (
                <nav aria-label={labels.title} className="flex flex-wrap gap-1">
                  {sections.map(({ initial }) => (
                    <a
                      key={initial}
                      href={`#letter-${initial}`}
                      className="flex size-7 items-center justify-center rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {initial}
                    </a>
                  ))}
                </nav>
              )}
            </div>
            <div className="flex flex-col gap-6">
              {sections.map(({ initial, entries: sectionEntries }) => (
                <section key={initial} id={`letter-${initial}`} aria-labelledby={`letter-${initial}-title`} className="scroll-mt-4">
                  <h2
                    id={`letter-${initial}-title`}
                    className="mb-2 border-b pb-1 text-sm font-semibold text-muted-foreground"
                  >
                    {initial}
                  </h2>
                  <ul className="grid gap-x-6 sm:grid-cols-2">
                    {sectionEntries.map((entry) => (
                      <li key={entry.id}>
                        <Link
                          href={`/${locale}/directory/${entry.id}`}
                          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                        >
                          <ContactAvatar name={entry.name} />
                          <span className="min-w-0 flex-1 text-sm font-medium break-words">{entry.name}</span>
                          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default DirectoryPage

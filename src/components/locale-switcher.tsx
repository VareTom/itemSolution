'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { LOCALES, type Locale } from '@/lib/i18n/locales'
import { cn } from '@/lib/utils'

type LocaleSwitcherProps = {
  currentLocale: Locale
  label: string
}

export const LocaleSwitcher = ({ currentLocale, label }: LocaleSwitcherProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

  return (
    <nav aria-label={label} className="flex gap-1">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`${pathname.replace(`/${currentLocale}`, `/${locale}`)}${query}`}
          hrefLang={locale}
          aria-current={locale === currentLocale ? 'true' : undefined}
          className={cn(
            buttonVariants({ variant: locale === currentLocale ? 'secondary' : 'ghost', size: 'sm' }),
            'uppercase',
          )}
        >
          {locale}
        </Link>
      ))}
    </nav>
  )
}

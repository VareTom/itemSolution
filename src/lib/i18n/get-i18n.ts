import 'server-only'
import { locale as localeParam } from 'next/root-params'
import { notFound } from 'next/navigation'
import { createFormatters } from '@/lib/format'
import { getDictionary } from './dictionaries'
import { isLocale } from './locales'

/** Resolves the locale of the current route (app/[locale]) with its dictionary and formatters. */
export const getI18n = async () => {
  const locale = await localeParam()
  if (!isLocale(locale)) notFound()
  return { locale, t: getDictionary(locale), format: createFormatters(locale) }
}

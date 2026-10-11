export const LOCALES = ['fr', 'nl'] as const
export const DEFAULT_LOCALE = 'fr'
export const LOCALE_COOKIE_NAME = 'its_locale'

export type Locale = (typeof LOCALES)[number]

export const INTL_LOCALES: Record<Locale, string> = {
  fr: 'fr-BE',
  nl: 'nl-BE',
}

export const isLocale = (value: string | undefined): value is Locale => LOCALES.some((locale) => locale === value)

/** Replaces "{name}" placeholders in a dictionary template. */
export const interpolate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder))

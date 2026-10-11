import type { Locale } from '@/lib/i18n/locales'
import { fr } from './fr'
import { nl } from './nl'

const DICTIONARIES = { fr, nl }

export const getDictionary = (locale: Locale) => DICTIONARIES[locale]

export type { Dictionary } from './fr'

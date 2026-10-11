import { createSerializer, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs/server'
import { DOCUMENT_CATEGORIES, OTHER_CATEGORY } from '@/lib/services/document-catalog'

export const CATEGORY_IDS = [...DOCUMENT_CATEGORIES.map(({ id }) => id), OTHER_CATEGORY.id]
export const SCOPES = ['personal', 'shared'] as const

export const documentsSearchParams = {
  q: parseAsString.withDefault(''),
  category: parseAsStringLiteral(CATEGORY_IDS),
  year: parseAsString,
  scope: parseAsStringLiteral(SCOPES),
  page: parseAsInteger.withDefault(1),
  preview: parseAsString,
}

export const serializeDocumentsSearchParams = createSerializer(documentsSearchParams)

export const isCategoryId = (value: string): value is (typeof CATEGORY_IDS)[number] =>
  CATEGORY_IDS.some((id) => id === value)

export const isScope = (value: string): value is (typeof SCOPES)[number] => SCOPES.some((scope) => scope === value)

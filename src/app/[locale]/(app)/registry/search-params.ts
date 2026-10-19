import { createSerializer, parseAsString, parseAsStringLiteral } from 'nuqs/server'
import { LOT_TYPES } from '@/lib/parsers/registry.parser'

export const registrySearchParams = {
  q: parseAsString.withDefault(''),
  type: parseAsStringLiteral(LOT_TYPES),
}

export const serializeRegistrySearchParams = createSerializer(registrySearchParams)

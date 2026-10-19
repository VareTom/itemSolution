import { load } from 'cheerio'
import { z } from 'zod'
import { cleanText } from './parse-values'

const REGISTRY_JSON_PATTERN = /var registryStruct\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/
const SHARE_PATTERN = /(\d+)\s*\/\s*(\d+)/

export const LOT_TYPES = ['apartment', 'cellar', 'indoorParking', 'outdoorParking', 'motorbike', 'other'] as const
export type LotType = (typeof LOT_TYPES)[number]

const LOT_TYPE_PATTERNS: [RegExp, LotType][] = [
  [/appart/i, 'apartment'],
  [/cave|kelder/i, 'cellar'],
  [/parking int|binnen/i, 'indoorParking'],
  [/parking ext|buiten/i, 'outdoorParking'],
  [/moto/i, 'motorbike'],
]

export const toLotType = (raw: string): LotType =>
  LOT_TYPE_PATTERNS.find(([pattern]) => pattern.test(raw))?.[1] ?? 'other'

const upstreamLotSchema = z.object({
  idreflot: z.coerce.string(),
  numero: z.string(),
  type: z.string(),
  idrefuser: z.coerce.string(),
  nom: z.string(),
  indivisaires: z
    .array(z.object({ idrefuser: z.coerce.string(), nom: z.string().optional() }))
    .nullable()
    .transform((coOwners) => coOwners ?? []),
})

const lotSchema = z.object({
  id: z.string().regex(/^\d+$/),
  number: z.string().min(1),
  type: z.enum(LOT_TYPES),
  typeLabel: z.string(),
  owners: z.array(z.object({ contactId: z.string(), name: z.string().nullable() })).min(1),
})

export type Lot = z.infer<typeof lotSchema>

/**
 * Reads every lot of the residence from the JSON the upstream registry page embeds (registryStruct).
 * Lot numbers are not unique (one lot can be listed once per owner), so lots are keyed by their id.
 */
export const parseRegistry = (html: string): Lot[] => {
  const json = html.match(REGISTRY_JSON_PATTERN)?.[1]
  if (!json) return []

  return z
    .array(upstreamLotSchema)
    .parse(JSON.parse(json))
    .map((lot) =>
      lotSchema.parse({
        id: lot.idreflot,
        number: cleanText(lot.numero),
        type: toLotType(lot.type),
        typeLabel: cleanText(lot.type),
        owners: [
          { contactId: lot.idrefuser, name: cleanText(lot.nom) },
          ...lot.indivisaires.map(({ idrefuser, nom }) => ({ contactId: idrefuser, name: nom ? cleanText(nom) : null })),
        ],
      }),
    )
}

const lotDetailsSchema = z.object({
  building: z.string().nullable(),
  floor: z.string().nullable(),
  share: z.object({ parts: z.number().int(), total: z.number().int().positive() }).nullable(),
  extra: z.array(z.object({ label: z.string().min(1), value: z.string() })),
})

export type LotDetails = z.infer<typeof lotDetailsSchema>

const KNOWN_LABELS = { lot: /^lot$/i, type: /^type$/i, building: /immeuble|gebouw/i, floor: /[ée]tage|verdieping/i, share: /quote|aandeel/i }

/** Reads a lot card (/registries/view_registry/registry-:id) as label/value rows. */
export const parseLotDetails = (html: string): LotDetails => {
  const $ = load(html)
  const rows = $('.block-ajax-table tr')
    .toArray()
    .map((row) => ({
      label: cleanText($(row).find('.field-title').text()),
      value: cleanText($(row).find('.field-value').first().text()),
    }))
    .filter(({ label }) => label !== '')

  const valueOf = (pattern: RegExp) => rows.find(({ label }) => pattern.test(label))?.value || null
  const share = valueOf(KNOWN_LABELS.share)?.match(SHARE_PATTERN)

  return lotDetailsSchema.parse({
    building: valueOf(KNOWN_LABELS.building),
    floor: valueOf(KNOWN_LABELS.floor),
    share: share ? { parts: Number(share[1]), total: Number(share[2]) } : null,
    extra: rows.filter(({ label }) => !Object.values(KNOWN_LABELS).some((pattern) => pattern.test(label))),
  })
}

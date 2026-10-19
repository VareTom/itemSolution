import { describe, expect, it } from 'bun:test'
import { parseLotDetails, parseRegistry } from './registry.parser'

const registryHtml = (lots: unknown[]) =>
  `<script type="text/javascript">var registryStruct = ${JSON.stringify(lots)};</script><ul class="selectable-list"></ul>`

const LOT_HTML = `
<table class="block-ajax-table"><tbody>
  <tr class="first"><td class="field-title">Lot</td><td class="field-value">006.C1 </td><td class="field-value"></td></tr>
  <tr class="line"><td colspan="2"></td></tr>
  <tr><td class="field-title">Type</td><td class="field-value">Cave</td></tr>
  <tr><td class="field-title">Immeuble</td><td class="field-value">000</td></tr>
  <tr><td class="field-title">Étage</td><td class="field-value">-1</td></tr>
  <tr><td class="field-title">Quote part</td><td class="field-value">25 &nbsp;/&nbsp;10000</td></tr>
  <tr><td class="field-title">Locataire</td><td class="field-value">MARTIN Bob</td></tr>
  <tr class="action"><td colspan="2"><a href="/pages/view_registry/registry-1">Voir l'historique de ce registre</a></td></tr>
</tbody></table>`

describe('parseRegistry', () => {
  it('should keep both lots when two owners share the same lot number', () => {
    const lots = parseRegistry(
      registryHtml([
        { idreflot: '1', numero: '006.C9', type: 'Cave', idrefuser: '11', nom: 'SRL EXEMPLE', indivisaires: [] },
        { idreflot: '2', numero: '006.C9', type: 'Cave', idrefuser: '22', nom: 'SPRL AUTRE', indivisaires: [] },
      ]),
    )

    expect(lots.map(({ id, number, owners }) => ({ id, number, owner: owners[0].name }))).toEqual([
      { id: '1', number: '006.C9', owner: 'SRL EXEMPLE' },
      { id: '2', number: '006.C9', owner: 'SPRL AUTRE' },
    ])
  })

  it('should treat missing co-owners as none when upstream sends null', () => {
    const [lot] = parseRegistry(
      registryHtml([{ idreflot: '3', numero: '07.1.2', type: 'Appartement', idrefuser: '11', nom: 'DUPONT Alice', indivisaires: null }]),
    )

    expect(lot).toEqual({
      id: '3',
      number: '07.1.2',
      type: 'apartment',
      typeLabel: 'Appartement',
      owners: [{ contactId: '11', name: 'DUPONT Alice' }],
    })
  })

  it('should list co-owners after the main owner when the lot is shared', () => {
    const [lot] = parseRegistry(
      registryHtml([
        {
          idreflot: '4',
          numero: '7.PI22',
          type: 'Parking intérieur',
          idrefuser: '11',
          nom: 'DUPONT Alice',
          indivisaires: [{ idrefuser: 33 }],
        },
      ]),
    )

    expect({ type: lot.type, owners: lot.owners }).toEqual({
      type: 'indoorParking',
      owners: [
        { contactId: '11', name: 'DUPONT Alice' },
        { contactId: '33', name: null },
      ],
    })
  })

  it('should return no lot when the page embeds no registry', () => {
    expect(parseRegistry('<ul class="selectable-list"></ul>')).toEqual([])
  })
})

describe('parseLotDetails', () => {
  it('should keep unknown rows as label and value when the lot card has extra rows', () => {
    expect(parseLotDetails(LOT_HTML)).toEqual({
      building: '000',
      floor: '-1',
      share: { parts: 25, total: 10000 },
      extra: [{ label: 'Locataire', value: 'MARTIN Bob' }],
    })
  })
})

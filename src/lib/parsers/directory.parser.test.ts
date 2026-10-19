import { describe, expect, it } from 'bun:test'
import { parseContact, parseDirectory } from './directory.parser'

const DIRECTORY_HTML = `
<ul class="selectable-list">
  <li class="item-first" id="contact-11" action="view_contact"><span class="bold">DUPONT Alice</span> </li>
  <li class="altrow" id="contact-22" action="view_contact"><span class="bold">Benoit MARTIN - Avocat </span> </li>
</ul>`

const CONTACT_HTML = `
<div id="block-user-profile-1" class="block-grey block-list"><div class="content"><table><tbody>
  <tr class="first"><td class="field-title-bold"> DUPONT Alice <!-- coproperty -->
    <span class="field-status"> Membre du conseil de copropriété </span></td></tr>
  <tr><td><div class="small-bold">A l'attention des copropriétaires</div><div class="field-note"> </div></td></tr>
</tbody></table></div></div>
<div id="block-user-information"><table><tbody>
  <tr><td class="field-title">Mail</td><td class="field-value"> Non visible <span class="private" title="Privé"></span></td></tr>
  <tr><td class="field-title">Téléphone portable</td><td class="field-value"> 0470 12 34 56 </td></tr>
  <tr><td class="field-title">Adresse</td><td class="field-value"><!--Rue Exemple, 1 <br/> MONS, 7000--> Rue Exemple, 1<br/>7000 MONS<br/></td></tr>
  <tr><td class="field-title">Fax</td><td class="field-value"> 065 00 00 00 </td></tr>
  <tr class="line"><td class="field-title">Lot</td><td class="field-value"> 07.1.2 (Appartement ) <br/> 7.PI22 (Parking intérieur ) <br/></td></tr>
</tbody></table></div>`

describe('parseDirectory', () => {
  it('should return every contact with its id when the tab lists contacts', () => {
    expect(parseDirectory(DIRECTORY_HTML)).toEqual([
      { id: '11', name: 'DUPONT Alice' },
      { id: '22', name: 'Benoit MARTIN - Avocat' },
    ])
  })

  it('should return no contact when the tab is empty', () => {
    expect(parseDirectory('<ul class="selectable-list"></ul>')).toEqual([])
  })
})

describe('parseContact', () => {
  it('should read the name and status without mixing them when the contact sits on the council', () => {
    const contact = parseContact(CONTACT_HTML, '11')

    expect({ name: contact?.name, status: contact?.status, note: contact?.note }).toEqual({
      name: 'DUPONT Alice',
      status: 'Membre du conseil de copropriété',
      note: null,
    })
  })

  it('should mark a field as hidden when the person chose not to share it', () => {
    expect(parseContact(CONTACT_HTML, '11')?.details[0]).toEqual({ field: 'email', label: 'Mail', value: null })
  })

  it('should recognise the mobile phone, keep address lines and keep unknown fields when the card lists them', () => {
    expect(parseContact(CONTACT_HTML, '11')?.details.slice(1)).toEqual([
      { field: 'mobile', label: 'Téléphone portable', value: '0470 12 34 56' },
      { field: 'address', label: 'Adresse', value: 'Rue Exemple, 1\n7000 MONS' },
      { field: 'other', label: 'Fax', value: '065 00 00 00' },
    ])
  })

  it('should split the lots with their type when the contact owns several lots', () => {
    expect(parseContact(CONTACT_HTML, '11')?.lots).toEqual([
      { number: '07.1.2', type: 'Appartement' },
      { number: '7.PI22', type: 'Parking intérieur' },
    ])
  })

  it('should return null when the page shows no contact', () => {
    expect(parseContact('<div id="content-view"></div>', '99')).toBeNull()
  })
})

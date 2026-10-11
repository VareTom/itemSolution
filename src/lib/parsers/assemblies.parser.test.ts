import { describe, expect, it } from 'bun:test'
import { parseAssembly, parseAssemblyList } from './assemblies.parser'

const TODAY = '2026-10-11'

const LIST_HTML = `
<table><tbody>
  <tr id="id1978" class=" altrow"><td></td>
    <td><a href="/assemblies/view/1978"> Assemblée Générale statutaire 2026 - EXEMPLE (STATUTAIRE)</a></td>
    <td>Hier</td><td>09:00</td><td>Hôtel Exemple, 7000 MONS</td></tr>
  <tr id="id1842" class=" "><td></td>
    <td><a href="/assemblies/view/1842">AG extraordinaire</a></td>
    <td>11/10/2025</td><td></td><td>Salle communale</td></tr>
  <tr class="item-last pager"><td colspan="5"></td></tr>
</tbody></table>`

const tooltip = (status: string, note = '') =>
  `&lt;div style='text-align:left'&gt;&lt;div&gt;Proposé par : Syndic Exemple&lt;/div&gt;&lt;div&gt;Statut : ${status} (Thursday 24 September 2026) &lt;/div&gt;${note ? `&lt;div&gt;Note : ${note}&lt;/div&gt;` : ''}&lt;/div&gt;`

const VIEW_HTML = `
<div id="block-assembly-quickedit-container">
  <div class="input text"><label>Nom</label><span> Assemblée Générale 2025 - EXEMPLE</span></div>
  <div class="input text"><label>Date</label><span>Saturday 11 October 2025</span></div>
  <div class="input text"><label>Heure</label><span>14:00</span></div>
  <div class="input text"><label>Lieu</label><span>Hôtel Exemple, 7000 MONS</span></div>
  <div class="input text"><label>Statut</label><span>CONVOCATIONS EMISES (Friday 26 September 2025 à 15:15)</span></div>
</div>
<div id="block-content-resolution">
  <div id="listItem_1" class="block-resolution">
    <div class="left"><a class="icon-edit-resolution" title="${tooltip("A L'ORDRE DU JOUR")}" href="/aresolutions/view/1">ACCUEIL ET BIENVENUE</a></div>
    <div class="right"><img src="/img/ticket-traite.png" title="A L'ORDRE DU JOUR" /></div>
  </div>
  <div id="listItem_2" class="block-resolution">
    <div class="left"><a class="icon-edit-resolution" title="${tooltip('NON RETENUE', '- Point A - Point B')}" href="/aresolutions/view/2">Panneaux solaires</a></div>
    <div class="right"><img src="/img/ticket-nouveau.png" title="NON RETENUE" /></div>
  </div>
</div>
<a href="/docs/get/733245" class="download"><img src="/img/fileicon-pdf.png" alt="" />Télécharger les annexes</a>`

describe('parseAssemblyList', () => {
  it('should split the assembly kind from its name and resolve relative dates', () => {
    expect(parseAssemblyList(LIST_HTML, TODAY)).toEqual([
      {
        id: '1978',
        name: 'Assemblée Générale statutaire 2026 - EXEMPLE',
        kind: 'STATUTAIRE',
        date: '2026-10-10',
        time: '09:00',
        place: 'Hôtel Exemple, 7000 MONS',
      },
      { id: '1842', name: 'AG extraordinaire', kind: null, date: '2025-10-11', time: null, place: 'Salle communale' },
    ])
  })
})

describe('parseAssembly', () => {
  it('should read the header, the convocation date and the annexes link when the assembly is displayed', () => {
    expect(parseAssembly(VIEW_HTML, '1842', TODAY)).toMatchObject({
      id: '1842',
      name: 'Assemblée Générale 2025 - EXEMPLE',
      date: '2025-10-11',
      time: '14:00',
      place: 'Hôtel Exemple, 7000 MONS',
      convocationsSentAt: '2025-09-26T15:15',
      annexesDocumentId: '733245',
    })
  })

  it('should read agenda items with their status, proposer and note from the tooltip', () => {
    expect(parseAssembly(VIEW_HTML, '1842', TODAY).agenda).toEqual([
      { id: '1', title: 'ACCUEIL ET BIENVENUE', status: 'on_agenda', proposedBy: 'Syndic Exemple', note: null },
      { id: '2', title: 'Panneaux solaires', status: 'rejected', proposedBy: 'Syndic Exemple', note: '- Point A - Point B' },
    ])
  })
})

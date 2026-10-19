import { describe, expect, it } from 'bun:test'
import { parseDocuments } from './documents.parser'
import { parseResidence, parseResidenceContact } from './residence.parser'

const DOCUMENTS_HTML = `
<div class="doc-ilist-container">
  <div class="ilist-title ilist-item-grey pointer" onclick="blockToogle(this, 'block-dfolder-21212');"><span class="ilist-arrow">&nbsp;</span>01-Acte de base/règlement/plans</div>
  <div id="block-dfolder-21212">
    <div class="ilist-item pointer first" onclick="openView(648461)">
      <div class="ilist-item-preview"><img src="/img/fileicon-pdf.png" alt="" /></div>
      <div class="ilist-item-title"> Implantation G&eacute;n&eacute;rale (DIS648461) </div>
      <div class="item-date ilist-item-grey">18/06/2024</div>
      <div class="item-size ilist-item-grey"> 22KB </div>
    </div>
  </div>
  <div class="ilist-title ilist-item-grey pointer" onclick="blockToogle(this, 'block-dfolder-21221');"><span class="ilist-arrow">&nbsp;</span>042-Décomptes individuels</div>
  <div id="block-dfolder-21221">
    <div class="ilist-item pointer" onclick="openView(795919)">
      <div class="ilist-item-preview"><img src="/img/fileicon-pdf.png" alt="" /></div>
      <div class="ilist-item-title"> APPEL DE FONDS (CIS1085853) </div>
      <div class="item-date ilist-item-grey">05/10/2026</div>
      <div class="item-size ilist-item-grey"> 129KB </div>
    </div>
  </div>
</div>`

const HEADER_HTML = `
<div id="view-copro" class="header-right block-view"><div class="content">
  <!--<div class="field-title">OLD NAME</div>-->
  <div class='field-title'>ACP EXEMPLE (0001)</div><div class='field-address1'>Rue Exemple, 1</div><div class='field-city'>7000 MONS</div><div class='field-locality'>Belgique</div>
</div></div>`

describe('parseDocuments', () => {
  it('should return every document with its folder, reference and decoded title when folders are listed', () => {
    expect(parseDocuments(DOCUMENTS_HTML)).toEqual([
      {
        id: '648461',
        title: 'Implantation Générale',
        reference: 'DIS648461',
        folderId: '21212',
        folderName: '01-Acte de base/règlement/plans',
        date: '2024-06-18',
        sizeBytes: 22528,
        fileType: 'pdf',
      },
      {
        id: '795919',
        title: 'APPEL DE FONDS',
        reference: 'CIS1085853',
        folderId: '21221',
        folderName: '042-Décomptes individuels',
        date: '2026-10-05',
        sizeBytes: 132096,
        fileType: 'pdf',
      },
    ])
  })
})

describe('parseResidence', () => {
  it('should return the residence name and address and ignore commented markup when the header card is present', () => {
    expect(parseResidence(HEADER_HTML)).toEqual({
      name: 'ACP EXEMPLE (0001)',
      addressLines: ['Rue Exemple, 1', '7000 MONS'],
    })
  })
})

const INFO_HTML = `
<div id="block-infos" class="block-view bg-gradient">
  <div class="infos-condo">
    <!-- Nb lots principaux : 77 <br/> -->
    Email : acp@example.com <br/>
    IBAN : BE37 0019 0679 0028 <br/>
    BIC : GEBABEBB <br/>
    N° BCE : 748.518.316 <br/>
  </div>
</div>`

describe('parseResidenceContact', () => {
  it('should return the e-mail and company number when the info block lists them', () => {
    expect(parseResidenceContact(INFO_HTML)).toEqual({ email: 'acp@example.com', companyNumber: '748.518.316' })
  })

  it('should return null values when the info block is missing', () => {
    expect(parseResidenceContact('<div></div>')).toEqual({ email: null, companyNumber: null })
  })
})

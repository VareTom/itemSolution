import { describe, expect, it } from 'bun:test'
import { parseTicket, parseTicketFormOptions, parseTicketList } from './tickets.parser'

const TICKET_LIST_HTML = `
<table><tbody>
  <tr id="TIS100" class="item altrow pointer">
    <td class="item"><img src="/img/ticket-traite.png" alt="" /></td>
    <td class="item">#TIS100</td>
    <td class="item"></td>
    <td class="item">Porte de garage en panne</td>
    <td class="item">DUPONT Alice</td>
    <td class="item"><div class="item-pretty-date">03/10/2025 à 14:31</div></td>
    <td class="item">MARTIN Bob</td>
  </tr>
  <tr id="TIS200" class="item pointer">
    <td class="item"><img src="/img/ticket-nouveau.png" alt="" /></td>
    <td class="item">#TIS200</td>
    <td class="item">02-Panne</td>
    <td class="item">Ascenseur bloqué</td>
    <td class="item">MARTIN Bob</td>
    <td class="item"><div class="item-pretty-date">Hier</div></td>
    <td class="item">MARTIN Bob</td>
  </tr>
</tbody></table>`

const TICKET_HTML = `
<div id="block-ticket-header-container">
  <span class="new-ticket status-icon-4">Référence - #TIS100</span>
  <div id="status-ticket">
    <span class="icon-status ">NOUVEAU</span><span class="icon-status ">EN COURS</span>
    <span class="icon-status ">EN ATTENTE</span><span class="icon-status active">TRAITÉ</span>
  </div>
  <div class="form-group form-title">De : </div><div class="form-group form-value-text">DUPONT Alice</div>
  <div class="form-group form-title">Titre : </div><div class="form-group form-value-text">Porte de garage en panne</div>
  <div class="form-group form-title">Date : </div><div class="form-group form-value-text">25/07/2025 à 03:08</div>
  <div class="form-group form-title bold">Visibilité : </div><div class="form-group form-value-text">COPROPRIETAIRES</div>
  <div class="form-group form-title">Assigné : </div><div class="form-group form-value-text">Syndic Exemple </div>
  <div class="form-group form-title">Classeur : </div><div class="form-group form-value-text"> Vide </div>
  <div class="form-group form-title">Lot : </div><div class="form-group form-value-text">Vide</div>
</div>
<div id="block-ticket-response-container">
  <div id="tmessage-mess2-container" class="message-container bg-gradient tmessage-mail">
    <div class="ticket-name right"> Syndic Exemple <br/> <div class="ticket-subtitle"></div></div>
    <div class="ticket-date left item-pretty-date"> 25 August 2025 à 14:19 </div>
    <div class="ticket-mail-header left">
      <div class="ticket-subtitle"><span class="bold">À : </span><div class="ticket-subtitle-email"> alice@example.com </div></div>
      <div class="ticket-subtitle"><span class="bold">Sujet : </span>Accès garage</div>
    </div>
    <div class="ticket-mail left"><div class="ticket-content"> <br />Bonjour,<br /> <br />Le serrurier passe demain.<br /> </div></div>
  </div>
  <div id="tmessage-mess1-container" class="message-container bg-white tmessage-main-message">
    <div class="ticket-name left"> DUPONT Alice <br/> <div class="ticket-subtitle"></div></div>
    <div class="ticket-date right item-pretty-date"> 25 July 2025 à 03:08 </div>
    <div class="ticket-main-message left"><div class="ticket-content"> La porte ne s&#039;ouvre plus.
      <br />Merci </div></div>
  </div>
</div>`

const TICKET_FORM_HTML = `
<select name="data[Ticket][tfolder_id]" id="TicketTfolderId">
  <option value="">---</option><option value="8052">01-Demande d&#039;information</option><option value="8053">02-Panne</option>
</select>
<select name="data[Ticket][door_id]" id="TicketDoorId">
  <option value="">---</option><option value="29881">006.C1 - Cave - DUPONT Alice</option>
</select>`

describe('parseTicketList', () => {
  it('should map status icons, empty folders and relative dates when tickets are listed', () => {
    const tickets = parseTicketList(TICKET_LIST_HTML)

    expect(tickets.map(({ reference, status, folder }) => ({ reference, status, folder }))).toEqual([
      { reference: 'TIS100', status: 'done', folder: null },
      { reference: 'TIS200', status: 'new', folder: '02-Panne' },
    ])
    expect(tickets[0]).toMatchObject({ id: '100', lastActivityAt: '2025-10-03T14:31', lastAuthor: 'MARTIN Bob' })
  })
})

describe('parseTicket', () => {
  it('should read the header fields and treat "Vide" as empty when the ticket is displayed', () => {
    expect(parseTicket(TICKET_HTML)).toMatchObject({
      id: '100',
      reference: 'TIS100',
      status: 'done',
      title: 'Porte de garage en panne',
      author: 'DUPONT Alice',
      createdAt: '2025-07-25T03:08',
      visibility: 'COPROPRIETAIRES',
      assignee: 'Syndic Exemple',
      folder: null,
      unit: null,
    })
  })

  it('should return plain-text messages with their channel and never the recipient e-mail when the thread has e-mails', () => {
    const { messages } = parseTicket(TICKET_HTML)

    expect(messages).toEqual([
      {
        id: '2',
        author: 'Syndic Exemple',
        postedAt: '2025-08-25T14:19',
        channel: 'email',
        subject: 'Accès garage',
        body: 'Bonjour,\n\nLe serrurier passe demain.',
      },
      {
        id: '1',
        author: 'DUPONT Alice',
        postedAt: '2025-07-25T03:08',
        channel: 'portal',
        subject: null,
        body: "La porte ne s'ouvre plus.\nMerci",
      },
    ])
    expect(JSON.stringify(messages)).not.toContain('alice@example.com')
  })
})

describe('parseTicketFormOptions', () => {
  it('should return folders and units without the empty placeholder option', () => {
    expect(parseTicketFormOptions(TICKET_FORM_HTML)).toEqual({
      folders: [
        { value: '8052', label: "01-Demande d'information" },
        { value: '8053', label: '02-Panne' },
      ],
      units: [{ value: '29881', label: '006.C1 - Cave - DUPONT Alice' }],
    })
  })
})

import { describe, expect, it } from 'bun:test'
import { parseHomeNotices, parseWall } from './wall.parser'

const WALL_HTML = `
<div class="block-wall block-list-wall">
  <div class="item ajax-item">
    <div class="item-by">Par <a href="/directories/view_contact/contact-11">DUPONT Alice</a></div>
    <div class="item-content-container"><div class="item-content">Bonjour,
      La porte du garage est bloqu&eacute;e.<br />Merci</div></div>
    <div class="item-pretty-date">02 December 2024 à 15:39</div>
    <div class="item-action"><a href="/walls/like/200" class="item-lnk-like">J'aime</a> (2) - <a href="/directories/myaccount/#wall-200" class="item-wall-comment">Commenter</a></div>
    <div class="item-by">Par <a href="/directories/view_contact/contact-22">MARTIN Bob</a></div>
    <div class="item-content-container"><div class="item-content">Qui a les cl&eacute;s du local v&eacute;los ?</div></div>
    <div class="item-pretty-date">18 January 2024 à 10:17</div>
    <div class="item-action"><a href="/walls/like/100" class="item-lnk-like">J'aime</a> - <a href="/directories/myaccount/#wall-100" class="item-wall-comment">Commenter</a></div>
  </div>
  <div id="item-child-201" class="fast-wall-comment fast-wall-child-200 ajax-item">
    <div class="item-by">Par <a href="/directories/view_contact/contact-22">MARTIN Bob</a></div>
    <div class="item-content-container"><div class="item-content">Le syndic est pr&eacute;venu.</div></div>
    <div class="item-pretty-date">14 December 2024 à 14:51</div>
    <div class="item-action"><a href="/walls/like/201" class="item-lnk-like">J'aime</a> - <a href="/directories/myaccount/#wall-200" class="item-wall-comment">Commenter</a></div>
  </div>
</div>`

const NOTICES_HTML = `
<div id="block-administrator-0"><div class="content"><ul><li> Nettoyage des vitres
  le 12/11 </li><li> </li></ul></div></div>
<div id="block-calandar-0"><div class="content"><div class="item">Rien de prévu!</div><ul></ul></div></div>`

describe('parseWall', () => {
  it('should read every post even when upstream nests a post inside the previous one', () => {
    expect(parseWall(WALL_HTML).map(({ id, author }) => ({ id, author }))).toEqual([
      { id: '200', author: 'DUPONT Alice' },
      { id: '100', author: 'MARTIN Bob' },
    ])
  })

  it('should group replies under their post when a post has answers', () => {
    const [post] = parseWall(WALL_HTML)

    expect(post.replies).toEqual([
      {
        id: '201',
        author: 'MARTIN Bob',
        authorContactId: '22',
        postedAt: '2024-12-14T14:51',
        body: 'Le syndic est prévenu.',
        likes: 0,
      },
    ])
  })

  it('should keep line breaks and decode entities when reading a post body', () => {
    expect(parseWall(WALL_HTML)[0].body).toBe('Bonjour,\nLa porte du garage est bloquée.\nMerci')
  })

  it('should read the date, likes and author contact when a post has been liked', () => {
    const [post] = parseWall(WALL_HTML)

    expect({ postedAt: post.postedAt, likes: post.likes, authorContactId: post.authorContactId }).toEqual({
      postedAt: '2024-12-02T15:39',
      likes: 2,
      authorContactId: '11',
    })
  })

  it('should return no post when the wall is empty', () => {
    expect(parseWall('<div class="block-list-wall"></div>')).toEqual([])
  })
})

describe('parseHomeNotices', () => {
  it('should read non-empty items when the block lists notices', () => {
    expect(parseHomeNotices(NOTICES_HTML, '[id^="block-administrator"]')).toEqual(['Nettoyage des vitres le 12/11'])
  })

  it('should return nothing when the block only shows its empty message', () => {
    expect(parseHomeNotices(NOTICES_HTML, '[id^="block-calandar"]')).toEqual([])
  })
})

import { describe, expect, it } from 'bun:test'
import { parseHiddenFields } from './form-fields.parser'

const HTML = `
<form id="other"><input type="hidden" name="ignored" value="x" /></form>
<form class="tmessage-form" method="post">
  <div style="display:none;"><input type="hidden" name="_method" value="POST" /></div>
  <input type="hidden" name="data[Tfile][ticket_id]" />
  <input type="hidden" name="data[Tfile][site_id]" value="1697" />
  <textarea name="data[Tfile][message]"></textarea>
</form>`

describe('parseHiddenFields', () => {
  it('should return the hidden inputs of the targeted form only and default missing values to empty', () => {
    expect(parseHiddenFields(HTML, 'form.tmessage-form')).toEqual([
      ['_method', 'POST'],
      ['data[Tfile][ticket_id]', ''],
      ['data[Tfile][site_id]', '1697'],
    ])
  })
})

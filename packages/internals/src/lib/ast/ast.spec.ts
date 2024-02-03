import { describe, expect, test } from 'vitest'

import { extractHtmlElementAttr_Text, format, parseTs } from './ast.js'

describe('parse', function () {
  test('parseJS with decorators', async function () {
    const parsed = parseTs(`
  		const a = 1
  		const b = 2

  		@annotation
  		class Test {}
  	`)
    expect(parsed).toMatchInlineSnapshot('"Program"')
  })

  test('find hardcoded a_href, img_src', async function () {
    const list = extractHtmlElementAttr_Text('/src/routes/+page.svelte', [
      { type: 'a', attr: 'href' },
      { type: 'img', attr: 'src' },
    ])

    expect(list.map((c) => format(c))).toMatchInlineSnapshot(`
      [
        "/src/routes/+page.svelte:9:9 a href www.google.com",
        "/src/routes/+page.svelte:12:10 img src test",
        "/src/routes/+page.svelte:14:11 a href www.google.com",
      ]
    `)
  })
})

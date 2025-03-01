import { describe, expect, it } from 'vitest'

import { extractHtmlElementAttr_Text, format, parseTs } from './ast.js'

describe('parse', () => {
  it('parseJS with decorators', async () => {
    const parsed = parseTs(`
  		const a = 1
  		const b = 2

  		@annotation
  		class Test {}
  	`)
    expect(parsed.type).toMatchInlineSnapshot(`"Program"`)
  })

  it('parseJS with top level await', async () => {
    const parsed = parseTs(`
      await fetch('https://www.google.com')
  	`)
    expect(parsed.body.length).toBe(1)
    expect(parsed.body[0].type).toBe('ExpressionStatement')
  })

  it('find hardcoded a_href, img_src', async () => {
    const list = extractHtmlElementAttr_Text('/src/routes/+page.svelte', [
      { type: 'a', attr: 'href' },
      { type: 'img', attr: 'src' },
    ])

    expect(list.map((c) => format(c))).toMatchInlineSnapshot(`
      [
        "/src/routes/+page.svelte:9:9 a href www.google.com",
        "/src/routes/+page.svelte:13:10 img src test",
        "/src/routes/+page.svelte:16:11 a href www.google.com",
      ]
    `)
  })
})

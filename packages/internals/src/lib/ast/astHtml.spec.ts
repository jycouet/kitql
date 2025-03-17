import { describe, expect, it } from 'vitest'

import { extractHtmlElementAttr_Text, formatHtmlError } from './astHtml.js'

describe('parse', function () {
	it('find hardcoded a_href, img_src', async function () {
		const list = extractHtmlElementAttr_Text('/src/routes/+page.svelte', [
			{ type: 'a', attr: 'href' },
			{ type: 'img', attr: 'src' },
		])

		expect(list.map((c) => formatHtmlError(c))).toMatchInlineSnapshot(`
			[
			  "/src/routes/+page.svelte:9:9 a href www.google.com",
			  "/src/routes/+page.svelte:13:10 img src test",
			  "/src/routes/+page.svelte:16:10 a href www.google.com",
			]
		`)
	})
})

import { test, expect, describe } from 'vitest'

import { parseSvelte } from './ast.js'

describe('parse', function () {
  test('parseJS with decorators', async function () {
    const parsed = parseSvelte(`
			const a = 1
			const b = 2

			@annotation
			class Test {}
		`)
    expect(parsed).toMatchInlineSnapshot(`
			const a = 1;
			const b = 2;

			@annotation
			class Test {}
		`)
  })
})

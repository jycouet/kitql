import { describe, expect, it } from 'vitest'

import { parse, print } from './ast.js'

describe('parse', function () {
	it('parse with decorators', async function () {
		const ast = parse(
			`
  		const a = 1
  		const b = 2

  		@annotation
  		class Test {}
  	`,
		)
		expect(ast.program.type).toMatchInlineSnapshot(`"Program"`)
	})

	it('parse with top level await', async function () {
		const ast = parse(`await fetch('https://www.google.com')`)
		expect(ast.program.body.length).toBe(1)
		expect(ast.program.body[0].type).toBe('ExpressionStatement')
	})
})

describe('print', function () {
	it('simple', function () {
		const code = `const a = 1;
const b = "hello"
		`

		const ast = parse(code)
		expect(print(ast.program).code).toMatchInlineSnapshot(`
			"const a = 1;
			const b = "hello";"
		`)
	})
})

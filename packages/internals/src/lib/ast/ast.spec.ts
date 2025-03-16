import { describe, expect, it } from 'vitest'

import { parse, print } from './ast.js'
import { read } from '$lib/fs/fs.js'

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
			const b = "hello""
		`)
	})

	it('@BackendMethod file', function () {
		const code = read("../vite-plugin-stripper/src/shared/actionsController.ts") ?? ""


		const ast = parse(code)
		expect(print(ast.program)).toMatchInlineSnapshot(`
			PrintResult {
			  "code": "import { BackendMethod, remult, type Allowed } from 'remult'

			// import { performance } from 'perf_hooks'
			// import { AUTH_SECRET } from "$env/static/private"

			// const helpers = async () => {
			// 	const { AUTH_SECRET } = await import('$env/static/private')
			// 	return { AUTH_SECRET }
			// }

			export class ActionsController {
				@BackendMethod({ allowed: () => remult.user === undefined })
				static async read(info: Allowed) {
					// if (import.meta.env.SSR) {
					const { plop } = await import('./toto.js')
					const { AUTH_SECRET } = await import('$env/static/private')
					const { performance: p } = await import('perf_hooks')
					const start = p.now()
					console.info('AUTH_SECRET', AUTH_SECRET)
					const end = p.now()
					console.info(end - start)
					plop()
					return AUTH_SECRET + ' ' + info
					// }
				}
			}",
			}
		`)
	})

	it('@Entity file', function () {
		const code = read("../vite-plugin-stripper/src/shared/User.ts") ?? ""

		const ast = parse(code)
		// expect(true).toBe(false)
		expect(print(ast.program)).toMatchInlineSnapshot(`
			PrintResult {
			  "code": "import { BackendMethod, Entity, Fields, remult, type Allowed } from 'remult'

			import { AUTH_SECRET } from '$env/static/private'

			@Entity('users', {
				allowApiCrud: true,
				saved: () => {
					console.info('AUTH_SECRET_saved', AUTH_SECRET)
					console.info('saved_top_secret')
					return {}
				},
				backendPrefilter: () => {
					console.info('AUTH_SECRET_backendPrefilter', AUTH_SECRET)
					console.info('backendPrefilter_top_secret')
					return {}
				},
				backendPreprocessFilter: (f) => {
					console.info('AUTH_SECRET_backendPreprocessFilter', AUTH_SECRET)
					console.info('backendPreprocessFilter_top_secret')
					return f
				},
				sqlExpression: () => {
					console.info('AUTH_SECRET_sqlExpression', AUTH_SECRET)
					console.info('sqlExpression_top_secret')
					return 'users'
				},
			})
			export class User {
				// @Fields.uuid()
				id = ''

				// @Fields.string()
				// name = ''

				@BackendMethod({
					// Only unauthenticated users can call this method
					allowed: () => remult.user === undefined,
				})
				static async hi(info: Allowed) {
					console.info('AUTH_SECRET', AUTH_SECRET)
					return AUTH_SECRET + ' ' + info
				}
			}",
			}
		`)
	})
})

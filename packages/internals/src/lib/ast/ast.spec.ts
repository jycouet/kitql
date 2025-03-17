import { describe, expect, it } from 'vitest'

import { read } from '../fs/fs.js'
import { parse, print } from './ast.js'

describe('parse', function () {
	it('parse with decorators', async function () {
		const parsed = parse(`
  		const a = 1
  		const b = 2

  		@annotation
  		class Test {}
  	`)
		expect(parsed.type).toMatchInlineSnapshot(`"File"`)
	})

	it('parse with top level await', async function () {
		const parsed = parse(`
      await fetch('https://www.google.com')
  	`)
		expect(parsed.program.body.length).toBe(1)
		expect(parsed.program.body[0].type).toBe('ExpressionStatement')
	})
})

describe('print', function () {
	it('simple', function () {
		const code = `const a = 1;
const b = "hello"
		`
		const ast = parse(code)
		expect(print(ast).code).toMatchInlineSnapshot(`
			"const a = 1;
			const b = "hello";"
		`)
	})

	it('null', function () {
		const ast = parse(null!)
		expect(print(ast).code).toMatchInlineSnapshot(`""`)
	})

	it('@BackendMethod file', function () {
		const code = read('../vite-plugin-stripper/src/shared/actionsController.ts') ?? ''

		const ast = parse(code)
		expect(print(ast).code).toMatchInlineSnapshot(`
			"// import { performance } from 'perf_hooks'
			// import { AUTH_SECRET } from "$env/static/private"
			// const helpers = async () => {
			//    const { AUTH_SECRET } = await import('$env/static/private')
			//    return { AUTH_SECRET }
			// }
			// if (import.meta.env.SSR) {
			// }
			import { BackendMethod, remult, type Allowed } from "remult";

			export class ActionsController {
			    @BackendMethod({
			        allowed: () => remult.user === undefined
			    })
			    static async read(info: Allowed) {
			        const {
			            plop
			        } = await import("./toto.js");

			        const {
			            AUTH_SECRET
			        } = await import("$env/static/private");

			        const {
			            performance: p
			        } = await import("perf_hooks");

			        const start = p.now();
			        console.info("AUTH_SECRET", AUTH_SECRET);
			        const end = p.now();
			        console.info(end - start);
			        plop();
			        return AUTH_SECRET + " " + info;
			    }
			}"
		`)
	})

	it('@Entity file', function () {
		const code = read('../vite-plugin-stripper/src/shared/User.ts') ?? ''

		const ast = parse(code)
		expect(print(ast).code).toMatchInlineSnapshot(`
			"// Only unauthenticated users can call this method
			import { BackendMethod, Entity, Fields, remult, type Allowed } from "remult";
			import { AUTH_SECRET } from "$env/static/private";

			@Entity("users", {
			    allowApiCrud: true,

			    backendPrefilter: () => {
			        console.info("AUTH_SECRET_backendPrefilter", AUTH_SECRET);
			        console.info("backendPrefilter_top_secret");
			        return {};
			    },

			    backendPreprocessFilter: f => {
			        console.info("AUTH_SECRET_backendPreprocessFilter", AUTH_SECRET);
			        console.info("backendPreprocessFilter_top_secret");
			        return f;
			    },

			    sqlExpression: () => {
			        console.info("AUTH_SECRET_sqlExpression", AUTH_SECRET);
			        console.info("sqlExpression_top_secret");
			        return "users";
			    }
			})
			export class User {
			    @Fields.uuid()
			    id = "";

			    @Fields.string()
			    name = "";

			    @BackendMethod({
			        allowed: () => remult.user === undefined
			    })
			    static async hi(info: Allowed) {
			        console.info("AUTH_SECRET", AUTH_SECRET);
			        return AUTH_SECRET + " " + info;
			    }
			}"
		`)
	})
})

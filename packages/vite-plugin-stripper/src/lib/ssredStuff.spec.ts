import { describe, expect, it } from 'vitest'
import { transformDecorator } from './ssredStuff.js'

describe('transformDecorator', () => {
	it('should add import.meta.env.SSR and log the performance bad import', async () => {
		const code = `
import { BackendMethod, remult, type Allowed } from 'remult'
import { performance } from 'perf_hooks'

const helpers = async () => {
	const { AUTH_SECRET } = await import('$env/static/private')
	return { AUTH_SECRET }
}

export class ActionsController {
	@BackendMethod({ allowed: () => remult.user === undefined })
	static async read(info: Allowed) {
		// Task 1, this needs to be inserted
		// if (import.meta.env.SSR) {
		const { plop } = await import('./toto.js')
		const { AUTH_SECRET } = await import('$env/static/private')
		helpers()
		// Task 2, we should log in the plugin that performance should not be imported dynamically but like: const { performance } = await import('perf_hooks')
		const start = performance.now()
		console.info('AUTH_SECRET', AUTH_SECRET)
		const end = performance.now()
		console.info(end - start)
		plop()
		return AUTH_SECRET + ' ' + info
		// }
	}
}
`

		const data = await transformDecorator(code, [{ decorator: 'BackendMethod' }])
		expect(data).toMatchInlineSnapshot(`
			{
			  "code": PrintResult {
			    "code": "import { BackendMethod, remult, type Allowed } from "remult";
			import { performance } from "perf_hooks";

			const helpers = async () => {
			    const {
			        AUTH_SECRET
			    } = await import("$env/static/private");

			    return {
			        AUTH_SECRET
			    };
			};

			export class ActionsController {
			    @BackendMethod({
			        allowed: () => remult.user === undefined
			    })
			    static async read(info: Allowed) {
			        if (import.meta.env.SSR) {
			            const {
			                plop
			            } = await import("./toto.js");

			            const {
			                AUTH_SECRET
			            } = await import("$env/static/private");

			            helpers();
			            const start = performance.now();
			            console.info("AUTH_SECRET", AUTH_SECRET);
			            const end = performance.now();
			            console.info(end - start);
			            plop();
			            return AUTH_SECRET + " " + info;
			        }
			    }
			}",
			  },
			  "info": [
			    "Wrapped with if(import.meta.env.SSR): ["ActionsController","BackendMethod","read"]",
			  ],
			}
		`)
	})


})


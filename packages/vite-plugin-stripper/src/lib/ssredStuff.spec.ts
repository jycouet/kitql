import { describe, expect, it } from 'vitest'
import { transformDecorator } from './ssredStuff.js'

describe('imports', () => {
	it('should return an import a', async () => {

		const code = `
import { BackendMethod, remult, type Allowed } from 'remult'

// import { AUTH_SECRET } from '$env/static/private'
// import { plop } from './toto.js'
import { performance } from 'perf_hooks'

const helpers = async () => {
	const { AUTH_SECRET } = await import('$env/static/private')
	return { AUTH_SECRET }
}

export class ActionsController {
	@BackendMethod({
		// Only unauthenticated users can call this method
		allowed: () => remult.user === undefined,
	})
	static async read(info: Allowed) {
		if (import.meta.env.SSR) {
			// const { performance } = await import('perf_hooks')
			const { plop } = await import('./toto.js')
			const { AUTH_SECRET } = await import('$env/static/private')
			helpers()
			const start = performance.now()
			console.info('AUTH_SECRET', AUTH_SECRET)
			const end = performance.now()
			console.info(end)
			plop()
			return AUTH_SECRET + ' ' + info
		}
		// return ""
	}
}

		`

		const data = await transformDecorator(code, [{ decorator: 'BackendMethod' }])
		expect(data).toMatchInlineSnapshot(`
			{
			  "finalRes": PrintResult {
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
			                console.info(end);
			                plop();
			                return AUTH_SECRET + " " + info;
			            }
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


// import { /* performance */ } from 'perf_hooks'
import { performance } from 'perf_hooks'

import { BackendMethod, remult, type Allowed } from 'remult'

import { AUTH_SECRET } from '$env/static/private'

export class ActionsController {
	@BackendMethod({
		// Only unauthenticated users can call this method
		allowed: () => remult.user === undefined,
	})
	static async read(info: Allowed) {
		const start = performance.now()
		console.info('AUTH_SECRET', AUTH_SECRET)
		const end = performance.now()
		console.info(`Time taken: ${end - start} milliseconds`)
		return AUTH_SECRET + ' ' + info
	}
}

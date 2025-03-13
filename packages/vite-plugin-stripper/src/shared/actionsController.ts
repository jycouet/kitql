import { BackendMethod, remult, type Allowed } from 'remult'

// import { AUTH_SECRET } from '$env/static/private'
// import { plop } from './toto.js'
// import { performance } from 'perf_hooks'

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
			console.info(`Time taken: ${end - start} milliseconds`)
			plop()
			return AUTH_SECRET + ' ' + info
		}
		// return ""
	}
}

import { BackendMethod, remult, type Allowed } from 'remult'
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
}

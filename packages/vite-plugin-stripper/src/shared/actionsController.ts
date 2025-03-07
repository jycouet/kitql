import { BackendMethod, remult, type Allowed } from 'remult'

import { AUTH_SECRET } from '$env/static/private'

export class ActionsController {
	@BackendMethod({
		// Only unauthenticated users can call this method
		allowed: () => remult.user === undefined,
	})
	static async read(info: Allowed) {
		console.info('AUTH_SECRET', AUTH_SECRET)
		return AUTH_SECRET + ' ' + info
	}
}

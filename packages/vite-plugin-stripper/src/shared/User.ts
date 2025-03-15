import { BackendMethod, Entity, Fields, remult, type Allowed } from 'remult'

import { AUTH_SECRET } from '$env/static/private'

@Entity('users', {
	allowApiCrud: true,
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
	@Fields.uuid()
	id = ''

	@Fields.string()
	name = ''

	@BackendMethod({
		// Only unauthenticated users can call this method
		allowed: () => remult.user === undefined,
	})
	static async hi(info: Allowed) {
		console.info('AUTH_SECRET', AUTH_SECRET)
		return AUTH_SECRET + ' ' + info
	}
}

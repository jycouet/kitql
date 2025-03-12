import { AUTH_SECRET } from "$env/static/private";
import { BackendMethod, Entity, Fields, remult, type Allowed } from "remult";

@Entity('users')
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

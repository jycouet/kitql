import { remultSveltekit } from 'remult/remult-sveltekit'
import { ActionsController } from '../shared/actionsController.js'
import { User } from '../shared/User.js'

export const api = remultSveltekit({
	entities: [User],
	controllers: [ActionsController],
})
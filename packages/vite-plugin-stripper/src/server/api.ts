import { remultSveltekit } from 'remult/remult-sveltekit'

import { ActionsController } from '../shared/actionsController.js'

export const api = remultSveltekit({
	controllers: [ActionsController],
})

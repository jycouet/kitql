import { remultSveltekit } from 'remult/remult-sveltekit'

import { ActionsController } from '../shared/actionsController.js'

export const handleRemult = remultSveltekit({
  controllers: [ActionsController],
})

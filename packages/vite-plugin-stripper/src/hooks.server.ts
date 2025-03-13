import { sequence } from '@sveltejs/kit/hooks'

import { api as handleRemult } from './server/api.js'

export const handle = sequence(handleRemult)

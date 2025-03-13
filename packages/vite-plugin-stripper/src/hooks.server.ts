import { sequence } from '@sveltejs/kit/hooks'

import { handleRemult } from './hooks/handleRemult.js'

export const handle = sequence(handleRemult)

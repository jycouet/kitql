import { defineParams } from '@sveltejs/kit/params'

import { match as ab } from './ab.ts'
import { match as int } from './int.ts'

// Kit 3 entry; per-file boolean matchers stay as the kit-routes legacy fixture
const kit3 = (match: (param: string) => boolean) => (param: string) =>
	match(param) ? param : undefined

export const params = defineParams({ ab: kit3(ab), int: kit3(int) })

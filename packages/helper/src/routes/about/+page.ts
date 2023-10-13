import { Log } from '$lib/Log.js'

import type { PageLoad } from './$types'

export const load = (async () => {
  const l = new Log('@kitql/helper')
  l.info('load!')

  return {}
}) satisfies PageLoad

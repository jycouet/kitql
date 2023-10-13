import { bgYellowBright, underline } from '$lib/colors/index.js'
// import { bgYellowBright, underline } from '$lib/index.js'
import { Log } from '$lib/Log.js'

export const load = async () => {
  const l = new Log('@kitql/helper')
  l.info(underline(bgYellowBright('load!')))

  return {}
}

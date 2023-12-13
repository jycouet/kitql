import { Log } from '$lib/Log.js'
import { green, yellow } from '$lib/index.js'

const logSQL = new Log(
  'SQL',
  { levelsToShow: 4 },
  // { prefixEmoji: '⚡️' }
)
export const load = async () => {
  logSQL.info(`Check out the ${yellow(`yellow`)} information`)
  logSQL.info(`Or the ${green(`green`)} one!`)
  logSQL.error(`Hooo no!`)
  logSQL.info(`Working on something...`, { level: 3 })
  logSQL.info(`Working on something else...`, { level: 4 })
  logSQL.success(`Perfect, it's fixed!`)
  return {}
}

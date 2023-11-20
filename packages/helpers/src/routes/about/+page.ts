// import {  underline } from '$lib/colors/index.js'
import { Log } from '$lib/Log.js'
import { stry0, underline } from '$lib/index.js'

export const load = async () => {
  const l = new Log('@kitql/helpers')
  l.info(underline('load!'))
  return {}
}

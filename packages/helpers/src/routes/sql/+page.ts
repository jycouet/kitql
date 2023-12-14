import { Log } from '$lib/Log.js'
import {
  bgBlack,
  bgBlackBright,
  bgBlue,
  bgBlueBright,
  bgCyan,
  bgCyanBright,
  bgGreen,
  bgGreenBright,
  bgMagenta,
  bgMagentaBright,
  bgRed,
  bgRedBright,
  bgWhite,
  bgWhiteBright,
  bgYellow,
  bgYellowBright,
  black,
  blackBright,
  blue,
  blueBright,
  bold,
  cyan,
  cyanBright,
  dim,
  gray,
  green,
  greenBright,
  hidden,
  inverse,
  italic,
  magenta,
  magentaBright,
  red,
  redBright,
  reset,
  strikethrough,
  underline,
  white,
  whiteBright,
  yellow,
  yellowBright,
} from '$lib/index.js'

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

  const msg = `with all colors: 
  ${bgBlack('bgBlack')}
  ${bgBlackBright('bgBlackBright')}
  ${bgBlue('bgBlue')}
  ${bgBlueBright('bgBlueBright')}
  ${bgCyan('bgCyan')}
  ${bgCyanBright('bgCyanBright')}
  ${bgGreen('bgGreen')}
  ${bgGreenBright('bgGreenBright')}
  ${bgMagenta('bgMagenta')}
  ${bgMagentaBright('bgMagentaBright')}
  ${bgRed('bgRed')}
  ${bgRedBright('bgRedBright')}
  ${bgWhite('bgWhite')}
  ${bgWhiteBright('bgWhiteBright')}
  ${bgYellow('bgYellow')}
  ${bgYellowBright('bgYellowBright')}
  ${black('black')}
  ${blackBright('blackBright')}
  ${blue('blue')}
  ${blueBright('blueBright')}
  ${bold('bold')}
  ${cyan('cyan')}
  ${cyanBright('cyanBright')}
  ${dim('dim')}
  ${gray('gray')}
  ${green('green')}
  ${greenBright('greenBright')}
  ${hidden('hidden')}
  ${inverse('inverse')}
  ${italic('italic')}
  ${magenta('magenta')}
  ${magentaBright('magentaBright')}
  ${red('red')}
  ${redBright('redBright')}
  ${reset('reset')}
  ${strikethrough('strikethrough')}
  ${underline('underline')}
  ${white('white')}
  ${whiteBright('whiteBright')}
  ${yellow('yellow')}
  ${yellowBright('yellowBright')}
`
  logSQL.info(msg)

  return {}
}

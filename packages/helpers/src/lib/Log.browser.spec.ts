import { beforeEach, describe, expect, it, vi } from 'vitest'

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
} from './colors/index.js'
import { Log } from './Log.js'

describe('kitql - helper - Log', () => {
  beforeEach(() => {
    vi.mock('esm-env', () => ({
      BROWSER: true,
    }))
  })

  it('with all colors browser', () => {
    const log = new Log('tool name')

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

    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(
      `
      [
        "%c tool name %c with all colors: 
          %cbgBlack%c
          %cbgBlackBright%c
          %cbgBlue%c
          %cbgBlueBright%c
          %cbgCyan%c
          %cbgCyanBright%c
          %cbgGreen%c
          %cbgGreenBright%c
          %cbgMagenta%c
          %cbgMagentaBright%c
          %cbgRed%c
          %cbgRedBright%c
          %cbgWhite%c
          %cbgWhiteBright%c
          %cbgYellow%c
          %cbgYellowBright%c
          %cblack%c
          %cblackBright%c
          %cblue%c
          %cblueBright%c
          %cbold%c
          %ccyan%c
          %ccyanBright%c
          %cdim%c
          %cgray%c
          %cgreen%c
          %cgreenBright%c
          %chidden%c
          %cinverse%c
          %citalic%c
          %cmagenta%c
          %cmagentaBright%c
          %cred%c
          %credBright%c
          %creset%c
          %cstrikethrough%c
          %cunderline%c
          %cwhite%c
          %cwhiteBright%c
          %cyellow%c
          %cyellowBright%c
        ",
        "background-color: #1e90ff",
        "",
        "background-color: black",
        "",
        "background-color: #a9a9a9",
        "",
        "background-color: blue",
        "",
        "background-color: #1e90ff",
        "",
        "background-color: cyan",
        "",
        "background-color: #00ffff",
        "",
        "background-color: green",
        "",
        "background-color: #7fff00",
        "",
        "background-color: #ff00ff",
        "",
        "background-color: #ff69b4",
        "",
        "background-color: red",
        "",
        "background-color: #ff4500",
        "",
        "background-color: white",
        "",
        "background-color: #ffffff",
        "",
        "background-color: yellow",
        "",
        "background-color: #ffd700",
        "",
        "color: black",
        "",
        "color: #a9a9a9",
        "",
        "color: blue",
        "",
        "color: #1e90ff",
        "",
        "font-weight: bold",
        "",
        "color: cyan",
        "",
        "color: #00ffff",
        "",
        "opacity: 0.5",
        "",
        "color: gray",
        "",
        "color: green",
        "",
        "color: #7fff00",
        "",
        "visibility: hidden",
        "",
        "filter: invert(1)",
        "",
        "font-style: italic",
        "",
        "color: #ff00ff",
        "",
        "color: #ff69b4",
        "",
        "color: red",
        "",
        "color: #ff4500",
        "",
        "",
        "",
        "text-decoration: line-through",
        "",
        "text-decoration: underline",
        "",
        "color: white",
        "",
        "color: #ffffff",
        "",
        "color: yellow",
        "",
        "color: #ffd700",
        "",
      ]
    `,
    )
  })

  it('with 2 red browser', () => {
    const log = new Log('tool name')

    const msg = `with red: ${red('red')} and another ${red('red2')}`

    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(`
      [
        "%c tool name %c with red: %cred%c and another %cred2%c",
        "background-color: #1e90ff",
        "",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
  })

  it('are we in the browser?', () => {
    const log = new Log('tool name')

    const msg = `with red: ${red('red')} and another ${red('red2')}`
    // no need to put browser: true! it's detected with this.windows
    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(`
      [
        "%c tool name %c with red: %cred%c and another %cred2%c",
        "background-color: #1e90ff",
        "",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
  })
})

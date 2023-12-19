import { describe, expect, it, vi } from 'vitest'

import { Log } from './Log.js'
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
import { stry0 } from './stry/stry.js'

describe('kitql - helper - Log', () => {
  it('Minimal config', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('Minimal config')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('info with withSuccess', () => {
    const log = new Log('tool name', { levelsToShow: 0 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('info with withSuccess', { withSuccess: true })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('info without withSuccess', () => {
    const log = new Log('tool name', { levelsToShow: 0 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('info without withSuccess', { withSuccess: false })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with an error', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'error')
    log.error('with an error')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with levels', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.infoO({ level: 0 }, 'level 0', { level: 0 })
    log.infoO({ level: 1 }, 'level 1', { level: 1 })
    log.infoO({ level: 2 }, 'level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with levels and display all levels', () => {
    const log = new Log('tool name', { levelsToShow: 2 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.successO({ level: 0 }, 'level 0', { level: 0 })
    log.successO({ level: 1 }, 'level 1', { level: 1 })
    log.successO({ level: 2 }, 'level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with all colors node', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')

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
    expect(spy).toHaveBeenCalledOnce()

    expect(stry0(result)).toMatchInlineSnapshot(
      `"["\\u001b[104m tool name \\u001b[49m","with all colors: \\n    \\u001b[40mbgBlack\\u001b[49m\\n    \\u001b[100mbgBlackBright\\u001b[49m\\n    \\u001b[44mbgBlue\\u001b[49m\\n    \\u001b[104mbgBlueBright\\u001b[49m\\n    \\u001b[46mbgCyan\\u001b[49m\\n    \\u001b[106mbgCyanBright\\u001b[49m\\n    \\u001b[42mbgGreen\\u001b[49m\\n    \\u001b[102mbgGreenBright\\u001b[49m\\n    \\u001b[45mbgMagenta\\u001b[49m\\n    \\u001b[105mbgMagentaBright\\u001b[49m\\n    \\u001b[41mbgRed\\u001b[49m\\n    \\u001b[101mbgRedBright\\u001b[49m\\n    \\u001b[47mbgWhite\\u001b[49m\\n    \\u001b[107mbgWhiteBright\\u001b[49m\\n    \\u001b[43mbgYellow\\u001b[49m\\n    \\u001b[103mbgYellowBright\\u001b[49m\\n    \\u001b[30mblack\\u001b[39m\\n    \\u001b[90mblackBright\\u001b[39m\\n    \\u001b[34mblue\\u001b[39m\\n    \\u001b[94mblueBright\\u001b[39m\\n    \\u001b[1mbold\\u001b[22m\\n    \\u001b[36mcyan\\u001b[39m\\n    \\u001b[96mcyanBright\\u001b[39m\\n    \\u001b[2mdim\\u001b[22m\\n    \\u001b[90mgray\\u001b[39m\\n    \\u001b[32mgreen\\u001b[39m\\n    \\u001b[92mgreenBright\\u001b[39m\\n    \\u001b[8mhidden\\u001b[28m\\n    \\u001b[7minverse\\u001b[27m\\n    \\u001b[3mitalic\\u001b[23m\\n    \\u001b[35mmagenta\\u001b[39m\\n    \\u001b[95mmagentaBright\\u001b[39m\\n    \\u001b[31mred\\u001b[39m\\n    \\u001b[91mredBright\\u001b[39m\\n    \\u001b[0mreset\\u001b[0m\\n    \\u001b[9mstrikethrough\\u001b[29m\\n    \\u001b[4munderline\\u001b[24m\\n    \\u001b[37mwhite\\u001b[39m\\n    \\u001b[97mwhiteBright\\u001b[39m\\n    \\u001b[33myellow\\u001b[39m\\n    \\u001b[93myellowBright\\u001b[39m\\n  "]"`,
    )
  })

  it('with DateTime', () => {
    const log = new Log('tool name', { levelsToShow: 2, withDate: 'dateTime' })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info(`log with DateTime`)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with Time', () => {
    const log = new Log('tool name', { levelsToShow: 2, withDate: 'time' })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info(`log with time`)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with no name', () => {
    const log = new Log('')

    const spy = vi.spyOn(console, 'info')
    const result = log.info(`with no name`)

    expect(spy).toHaveBeenCalledOnce()

    expect(result).toMatchInlineSnapshot(`
      [
        "with no name",
      ]
    `)
  })

  it('with 2 red', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    const msg = `with red: ${red('red')} and another ${red('red2')}`
    const result = log.info(msg)
    expect(spy).toHaveBeenCalledOnce()

    expect(stry0(result)).toMatchInlineSnapshot(
      `"["\\u001b[104m tool name \\u001b[49m","with red: \\u001b[31mred\\u001b[39m and another \\u001b[31mred2\\u001b[39m"]"`,
    )
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  black,
  blue,
  bold,
  cyan,
  gray,
  green,
  italic,
  Log,
  magenta,
  red,
  strikethrough,
  stry,
  white,
  yellow,
} from '../src'

// helper
function fakeIsBrowser() {
  vi.stubGlobal('window', { document: 'coucou' })
}

describe('kitql - helper - Log', () => {
  beforeEach(() => {
    vi.stubGlobal('window', undefined)
    vi.clearAllMocks()
  })

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
    log.info('level 0', { level: 0 })
    log.info('level 1', { level: 1 })
    log.info('level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with levels and display all levels', () => {
    const log = new Log('tool name', { levelsToShow: 2 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.success('level 0', { level: 0 })
    log.success('level 1', { level: 1 })
    log.success('level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with all colors node', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')

    const msg = `with all colors: 
    ${black('black')},   
    ${red('red')}, 
    ${green('green')}, 
    ${yellow('yellow')}
    ${blue('blue')}
    ${magenta('magenta')}, 
    ${cyan('cyan')} 
    ${white('white')} 
    ${gray('gray')} 
    ${bold('bold')} 
    ${italic('italic')} 
    ${strikethrough('strikethrough')} 
  `

    const result = log.info(msg)
    expect(spy).toHaveBeenCalledOnce()

    expect(stry(result, 0)).toMatchInlineSnapshot(
      '"[\\"\\\\u001b[35m[tool name]\\\\u001b[39m with all colors: \\\\n    \\\\u001b[30mblack\\\\u001b[39m,   \\\\n    \\\\u001b[31mred\\\\u001b[39m, \\\\n    \\\\u001b[32mgreen\\\\u001b[39m, \\\\n    \\\\u001b[33myellow\\\\u001b[39m\\\\n    \\\\u001b[34mblue\\\\u001b[39m\\\\n    \\\\u001b[35mmagenta\\\\u001b[39m, \\\\n    \\\\u001b[36mcyan\\\\u001b[39m \\\\n    \\\\u001b[37mwhite\\\\u001b[39m \\\\n    \\\\u001b[90mgray\\\\u001b[39m \\\\n    \\\\u001b[1mbold\\\\u001b[22m \\\\n    \\\\u001b[3mitalic\\\\u001b[23m \\\\n    \\\\u001b[9mstrikethrough\\\\u001b[29m \\\\n  \\"]"',
    )
  })

  it('with all colors browser', () => {
    fakeIsBrowser()

    const log = new Log('tool name')

    const msg = `with all colors: 
    ${black('black')},   
    ${red('red')}, 
    ${green('green')}, 
    ${yellow('yellow')}
    ${blue('blue')}
    ${magenta('magenta')}, 
    ${cyan('cyan')} 
    ${white('white')} 
    ${gray('gray')} 
    ${bold('bold')} 
    ${italic('italic')} 
    ${strikethrough('strikethrough')} 
  `

    const result = log.info(msg, { browser: true })

    expect(result).toMatchInlineSnapshot(
      `
      [
        "%c[tool name]%c with all colors: 
          %cblack%c,   
          %cred%c, 
          %cgreen%c, 
          %cyellow%c
          %cblue%c
          %cmagenta%c, 
          %ccyan%c 
          %cwhite%c 
          %cgray%c 
          %cbold%c 
          %citalic%c 
          %cstrikethrough%c 
        ",
        "color: #ff00ff",
        "",
        "color: black",
        "",
        "color: red",
        "",
        "color: green",
        "",
        "color: yellow",
        "",
        "color: blue",
        "",
        "color: #ff00ff",
        "",
        "color: cyan",
        "",
        "color: white",
        "",
        "color: gray",
        "",
        "font-weight: bold",
        "",
        "font-style: italic",
        "",
        "text-decoration: line-through",
        "",
      ]
    `,
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

    expect(stry(result, 0)).toMatchInlineSnapshot(
      '"[\\"\\\\u001b[35m[tool name]\\\\u001b[39m with red: \\\\u001b[31mred\\\\u001b[39m and another \\\\u001b[31mred2\\\\u001b[39m\\"]"',
    )
  })

  it('with 2 red browser', () => {
    fakeIsBrowser()

    const log = new Log('tool name')

    const msg = `with red: ${red('red')} and another ${red('red2')}`

    const result = log.info(msg, { browser: true })

    expect(result).toMatchInlineSnapshot(`
      [
        "%c[tool name]%c with red: %cred%c and another %cred2%c",
        "color: #ff00ff",
        "",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
  })

  it('are we NOT in the browser?', () => {
    const log = new Log('tool name')

    expect(log).to.have.property('isBrowser', false)
  })

  it('are we in the browser?', () => {
    fakeIsBrowser()

    const log = new Log('tool name')

    expect(log).to.have.property('isBrowser', true)

    const msg = `with red: ${red('red')} and another ${red('red2')}`
    // no need to put browser: true! it's detected with this.windows
    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(`
      [
        "%c[tool name]%c with red: %cred%c and another %cred2%c",
        "color: #ff00ff",
        "",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
  })
})

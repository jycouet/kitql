import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Log, logCyan, logGreen, logMagneta, logRed, logYellow } from '../src/Log'
import { stry } from '../src/stry'

describe('kitql - helper - Log', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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

  it('with all colors', () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    const msg = `with all colors: ${logGreen('green')}, ${logMagneta('magneta')}, ${logRed(
      'red',
    )}, ${logCyan('cyan')}, ${logYellow('yellow')}`
    const result = log.info(msg)
    expect(spy).toHaveBeenCalledOnce()

    expect(stry(result, 0)).toMatchInlineSnapshot(
      '"[\\"\\\\u001b[35m[tool name]\\\\u001b[37m\\\\u001b[0m with all colors: \\\\u001b[32mgreen\\\\u001b[37m\\\\u001b[0m, \\\\u001b[35mmagneta\\\\u001b[37m\\\\u001b[0m, \\\\u001b[31mred\\\\u001b[37m\\\\u001b[0m, \\\\u001b[36mcyan\\\\u001b[37m\\\\u001b[0m, \\\\u001b[33myellow\\\\u001b[37m\\\\u001b[0m\\"]"',
    )
  })

  it('with all colors browser', () => {
    const log = new Log('tool name')

    const msg = `with all colors: ${logGreen('green')}, ${logMagneta('magneta')}, ${logRed(
      'red',
    )}, ${logCyan('cyan')}, ${logYellow('yellow')}`
    const result = log.info(msg, { browser: true })

    expect(result).toMatchInlineSnapshot(
      `
      [
        "%c[tool name]%c with all colors: %cgreen%c, %cmagneta%c, %cred%c, %ccyan%c, %cyellow%c",
        "color: #ff00ff",
        "",
        "color: green",
        "",
        "color: #ff00ff",
        "",
        "color: red",
        "",
        "color: cyan",
        "",
        "color: yellow",
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

  it('dynamic setLevel', () => {
    const log = new Log('tool name', { levelsToShow: 0 })

    const spy = vi.spyOn(console, 'info')
    log.info(`log level 1 NOT SHOWN`, { level: 1 })
    expect(spy).toHaveBeenCalledTimes(0)
    log.setLevel(1)
    log.info(`log level 1 SHOWN`, { level: 1 })
    expect(spy).toHaveBeenCalledTimes(1)
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
    const msg = `with red: ${logRed('red')} and another ${logRed('red2')}`
    const result = log.info(msg)
    expect(spy).toHaveBeenCalledOnce()

    expect(stry(result, 0)).toMatchInlineSnapshot(
      '"[\\"\\\\u001b[35m[tool name]\\\\u001b[37m\\\\u001b[0m with red: \\\\u001b[31mred\\\\u001b[37m\\\\u001b[0m and another \\\\u001b[31mred2\\\\u001b[37m\\\\u001b[0m\\"]"',
    )
  })

  it('with 2 red browser', () => {
    const log = new Log('tool name')

    const msg = `with red: ${logRed('red')} and another ${logRed('red2')}`
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
    const log = new Log('tool name')

    // @ts-ignore
    this.window = { document: 'coucou' }

    expect(log).to.have.property('isBrowser', true)

    const msg = `with red: ${logRed('red')} and another ${logRed('red2')}`
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

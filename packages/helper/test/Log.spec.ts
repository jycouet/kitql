import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Log, logCyan, logGreen, logMagneta, logRed, logYellow } from '../src/Log'

describe('kitql - helper - Log', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Minimal config', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('Minimal config')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('info with withSuccess', async () => {
    const log = new Log('tool name', { levelsToShow: 0 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('info with withSuccess', { withSuccess: true })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('info without withSuccess', async () => {
    const log = new Log('tool name', { levelsToShow: 0 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('info without withSuccess', { withSuccess: false })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with an error', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'error')
    log.error('with an error')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with levels', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info('level 0', { level: 0 })
    log.info('level 1', { level: 1 })
    log.info('level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with levels and display all levels', async () => {
    const log = new Log('tool name', { levelsToShow: 2 })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.success('level 0', { level: 0 })
    log.success('level 1', { level: 1 })
    log.success('level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with all colors', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    const msg = `with all colors: ${logGreen('green')}, ${logMagneta('magneta')}, ${logRed('red')}, ${logCyan(
      'cyan'
    )}, ${logYellow('yellow')}`
    log.info(msg)
    expect(spy).toHaveBeenCalledOnce()

    expect(log).to.have.property('lastStr', `${logMagneta('[tool name]')} ${msg}`)
  })

  it('with DateTime', async () => {
    const log = new Log('tool name', { levelsToShow: 2, withDate: 'dateTime' })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info(`log with DateTime`)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with Time', async () => {
    const log = new Log('tool name', { levelsToShow: 2, withDate: 'time' })
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(console, 'info')
    log.info(`log with time`)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('dynamic setLevel', async () => {
    const log = new Log('tool name', { levelsToShow: 0 })

    const spy = vi.spyOn(console, 'info')
    log.info(`log level 1 NOT SHOWN`, { level: 1 })
    expect(spy).toHaveBeenCalledTimes(0)
    log.setLevel(1)
    log.info(`log level 1 SHOWN`, { level: 1 })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('with no name', async () => {
    const log = new Log('')

    const spy = vi.spyOn(console, 'info')
    log.info(`with no name`)

    expect(spy).toHaveBeenCalledOnce()

    expect(log).to.have.property('lastStr', 'with no name')
  })
})

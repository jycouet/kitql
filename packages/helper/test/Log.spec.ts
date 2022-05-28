import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Log, logCyan, logGreen, logMagneta, logRed, logYellow } from '../src/Log'

describe('kitql - helper - Log', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('Minimal config', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info('Minimal config')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('info with withSuccess', async () => {
    const log = new Log('tool name', 0)
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info('info with withSuccess', { withSuccess: true })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('info without withSuccess', async () => {
    const log = new Log('tool name', 0)
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info('info without withSuccess', { withSuccess: false })
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with an error', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'error')
    log.error('with an error')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with levels', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info('level 0', { level: 0 })
    log.info('level 1', { level: 1 })
    log.info('level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with levels and display all levels', async () => {
    const log = new Log('tool name', 2)
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'success')
    log.success('level 0', { level: 0 })
    log.success('level 1', { level: 1 })
    log.success('level 2', { level: 2 })
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('with all colors', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info(
      `with all colors: ${logGreen('green')}, ${logMagneta('magneta')}, ${logRed('red')}, ${logCyan(
        'cyan'
      )}, ${logYellow('yellow')}`
    )
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with DateTime', async () => {
    const log = new Log('tool name', 2, 'dateTime')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info(`log with DateTime`)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with Time', async () => {
    const log = new Log('tool name', 2, 'time')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info(`log with time`)
    expect(spy).toHaveBeenCalledOnce()
  })
})

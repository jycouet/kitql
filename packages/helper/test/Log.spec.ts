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

  it('with an error', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'error')
    log.error('with an error')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('with all colors', async () => {
    const log = new Log('tool name')
    expect(log).to.have.property('toolName', 'tool name')

    const spy = vi.spyOn(log, 'info')
    log.info(
      `with all colors: ${logGreen('green')}, ${logMagneta('magneta')}, ${logRed('red')}, 
			${logCyan('cyan')}, ${logYellow('yellow')}`
    )
    expect(spy).toHaveBeenCalledOnce()
  })
})

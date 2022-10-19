import { beforeEach, describe, expect, it, vi } from 'vitest'

import { sleep } from '../src/sleep'

describe('kitql - helper - sleep', () => {
  it('No time', async () => {
    const start = new Date()
    await sleep(0)
    const timestamp = new Date().getTime() - start.getTime()
    console.info(`timestamp No time`, timestamp)
    expect(timestamp).toBeLessThan(3)
  })

  it('1000 ms', async () => {
    const start = new Date()
    await sleep(1000)
    const timestamp = new Date().getTime() - start.getTime()
    console.info(`timestamp 1000 ms`, timestamp)
    expect(timestamp).toBeLessThan(1010)
    expect(990).toBeLessThan(timestamp)
  })
})

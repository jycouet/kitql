import { describe, expect, it } from 'vitest'

import watchAndRun from './index.js'

describe('vite-plugin-watch-and-run', () => {
  it('Should throw an error as no config is sent', async () => {
    const p = watchAndRun(null as any)
    try {
      await p.getCheckedConf()
    } catch (error: any) {
      expect(error.message).toEqual('plugin watchAndRun, `params` needs to be an array.')
    }
  })

  it('Should throw an error as no watch', async () => {
    const p = watchAndRun([{} as any])
    try {
      await p.getCheckedConf()
    } catch (error: any) {
      expect(error.message).toEqual('plugin watch-and-run, `watch` or `watchFile` is missing.')
    }
  })

  it('Should throw an error as no run', async () => {
    const p = watchAndRun([{ watch: 'hello!' } as any])
    try {
      await p.getCheckedConf()
    } catch (error: any) {
      expect(error.message).toEqual('plugin watch-and-run, `run` is missing.')
    }
  })

  it('Should have a valid conf, with default all defaults', async () => {
    const p = watchAndRun([{ watch: '**/*.(gql|graphql)', run: 'npm run gen' }])

    expect(await p.getCheckedConf()).toMatchInlineSnapshot(`
      [
        {
          "delay": 300,
          "formatErrors": undefined,
          "isRunning": false,
          "kind": [
            "add",
            "change",
            "unlink",
          ],
          "logs": [
            "trigger",
            "streamData",
            "streamError",
            "end",
          ],
          "name": undefined,
          "run": "npm run gen",
          "shell": true,
          "watch": "**/*.(gql|graphql)",
          "watchFile": undefined,
        },
      ]
    `)
  })
})

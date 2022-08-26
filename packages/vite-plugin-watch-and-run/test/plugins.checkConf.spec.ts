import watchAndRun, { KindWithoutPath, kindWithoutPath, kindWithPath } from '../src'
import { describe, expect, it, vi } from 'vitest'

describe('vite-plugin-watch-and-run', () => {
  it('Should throw an error as no config is sent', async () => {
    const p = watchAndRun(null as any)
    try {
      await p.getCheckedConf()
    } catch (error) {
      expect(error.message).toEqual('plugin watchAndRun, `params` needs to be an array.')
    }
  })

  it('Should throw an error as no watch', async () => {
    const p = watchAndRun([{} as any])
    try {
      await p.getCheckedConf()
    } catch (error) {
      expect(error.message).toEqual("plugin watch-and-run, `watch` or `watchFile` is missing.")
    }
  })

  it('Should throw an error as no run', async () => {
    const p = watchAndRun([{ watch: 'hello!' } as any])
    try {
      await p.getCheckedConf()
    } catch (error) {
      expect(error.message).toEqual("plugin watch-and-run, `run` is missing.")
    }
  })

  it('Should have a valid conf, with default all defaults', async () => {
    const p = watchAndRun([{ watch: '**/*.(gql|graphql)', run: 'yarn gen' }])

    expect(await p.getCheckedConf()).toMatchInlineSnapshot(`
      [
        {
          "delay": 300,
          "isRunning": false,
          "kind": [
            "add",
            "change",
            "unlink",
          ],
          "name": undefined,
          "quiet": false,
          "run": "yarn gen",
          "watch": "**/*.(gql|graphql)",
          "watchFile": undefined,
        },
      ]
    `)
  })

  // it('Should register all watchers', async () => {
  //   const watch = '**/*.(gql|graphql)'
  //   const plugin = watchAndRun([{ watch, run: 'yarn gen' }])

  //   const server = {
  //     watcher: {
  //       on: vi.fn(),
  //     },
  //   }

  //   const spy = vi.spyOn(server.watcher, 'on').mockImplementation((type: 'add' | 'change' | 'unlink', callback) => {
  //     if (kindWithPath.includes(type) || kindWithoutPath.includes(type as KindWithoutPath)) {
  //       // eslint-disable-next-line unicorn/no-lonely-if
  //       if (typeof callback === 'function') return 'registered'
  //     }
  //     return 'error'
  //   })
    
  //   plugin.configureServer(server)
    
  //   expect(spy).toHaveBeenCalledTimes(9)
  //   const operations = ['add', 'addDir', 'change', 'unlink', 'unlinkDir', 'all', 'error', 'raw', 'ready']
  //   spy.mock.calls.forEach((call, index) => {
  //     expect(spy).toHaveBeenNthCalledWith(index + 1, operations[index], call[1])
  //     expect(spy).toHaveNthReturnedWith(index + 1, 'registered')
  //   })
  // })
})

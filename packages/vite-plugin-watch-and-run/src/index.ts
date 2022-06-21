import { Log, logCyan, logGreen, logRed } from '@kitql/helper'
import { spawn } from 'child_process'
import micromatch from 'micromatch'

export type Options = {
  /**
   * watch files to trigger the run action (glob format)
   */
  watch: string
  /**
   * Kind of watch that will trigger the run action
   */
  watchKind?: WatchKind[]
  /**
   * run command (yarn gen for example!)
   */
  run: string
  /**
   * Delay before running the run command (in ms)
   * @default 300 ms
   */
  delay?: number | null
  /**
   * Name to display in the logs as prefix
   */
  name?: string | null
}

export type WatchKind = 'ADD' | 'CHANGE' | 'DELETE'

export type StateDetail = {
  kind: ('ADD' | 'CHANGE' | 'DELETE')[]
  run: string
  delay: number
  isRunning: boolean
  name?: string | null
}

function checkConf(params: Options[]) {
  if (!Array.isArray(params)) {
    throw new Error('plugin watchAndRun, `params` needs to be an array.')
  }

  const paramsChecked: Record<string, StateDetail> = {}

  for (let i = 0; i < params.length; i++) {
    const param = params[i]
    if (!param.watch) {
      throw new Error('plugin watch-and-run, `watch` is missing.')
    }
    if (!param.run) {
      throw new Error('plugin watch-and-run, `run` is missing.')
    }

    paramsChecked[param.watch] = {
      kind: param.watchKind ?? ['ADD', 'CHANGE', 'DELETE'],
      run: param.run,
      delay: param.delay ?? 300,
      isRunning: false,
      name: param.name,
    }
  }

  return paramsChecked
}

async function shouldRun(absolutePath: string, watchKind: WatchKind, watchAndRunConf: Record<string, StateDetail>) {
  for (const globToWatch in watchAndRunConf) {
    const param = watchAndRunConf[globToWatch]
    if (!param.isRunning && param.kind.includes(watchKind) && micromatch.isMatch(absolutePath, globToWatch)) {
      return {
        shouldRun: true,
        globToWatch,
        param,
      }
    }
  }
  return {
    shouldRun: false,
    globToWatch: null,
    param: null,
  }
}

function formatLog(str: string, name?: string) {
  return `${name ? logCyan(`[${name}]`) : ''} ${str}`
}

async function watcher(absolutePath: string, watchKind: WatchKind, watchAndRunConf: Record<string, StateDetail>) {
  const shouldRunInfo = await shouldRun(absolutePath, watchKind, watchAndRunConf)
  if (shouldRunInfo.shouldRun) {
    watchAndRunConf[shouldRunInfo.globToWatch].isRunning = true

    log.info(
      `${logGreen('✔')} Thx to ${logGreen(shouldRunInfo.globToWatch)}, ` +
        `triggered by ${logCyan(watchKind)} ${logGreen(absolutePath)}, ` +
        `we will wait ${logCyan(shouldRunInfo.param.delay + 'ms')} and run ${logGreen(shouldRunInfo.param.run)}.`
    )

    // Run after a delay
    setTimeout(() => {
      const child = spawn(shouldRunInfo.param.run, [], { shell: true })

      //spit stdout to screen
      child.stdout.on('data', data => {
        process.stdout.write(formatLog(data.toString(), shouldRunInfo.param.name))
      })

      //spit stderr to screen
      child.stderr.on('data', data => {
        process.stdout.write(formatLog(data.toString(), shouldRunInfo.param.name))
      })

      child.on('close', code => {
        if (code === 0) {
          log.info(`${logGreen('✔')} finished ${logGreen('successfully')}`)
        } else {
          log.error(`${'❌'} finished with some ${logRed('errors')}`)
        }
        shouldRunInfo.param.isRunning = false
      })

      return
    }, shouldRunInfo.param.delay)
  }

  return
}

const log = new Log('KitQL vite-plugin-watch-and-run')

export default function watchAndRun(params: Options[]) {
  // check params, throw Errors if not valid and return a new object representing the state of the plugin
  const watchAndRunConf = checkConf(params)

  return {
    name: 'watch-and-run',

    watchAndRunConf,

    configureServer(server) {
      const watcherAdd = async absolutePath => {
        watcher(absolutePath, 'ADD', watchAndRunConf)
      }
      const watcherChange = async absolutePath => {
        watcher(absolutePath, 'CHANGE', watchAndRunConf)
      }
      const watcherDelete = async absolutePath => {
        watcher(absolutePath, 'DELETE', watchAndRunConf)
      }

      server.watcher.on('add', watcherAdd)
      server.watcher.on('change', watcherChange)
      server.watcher.on('delete', watcherDelete)
    },
  }
}

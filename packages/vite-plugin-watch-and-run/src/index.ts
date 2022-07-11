import { Log, logCyan, logGreen, logMagneta, logRed } from '@kitql/helper'
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

export const kindWithPath = ['add', 'addDir', 'change', 'delete', 'unlink', 'unlinkDir'] as const
export type KindWithPath = typeof kindWithPath[number]
export const kindWithoutPath = ['all', 'error', 'raw', 'ready'] as const
export type KindWithoutPath = typeof kindWithoutPath[number]
export type WatchKind = KindWithPath | KindWithoutPath

export type StateDetail = {
  kind: WatchKind[]
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

  params.forEach(param => {
    if (!param.watch) {
      throw new Error('plugin watch-and-run, `watch` is missing.')
    }
    if (!param.run) {
      throw new Error('plugin watch-and-run, `run` is missing.')
    }

    paramsChecked[param.watch] = {
      kind: param.watchKind ?? ['add', 'change', 'delete'],
      run: param.run,
      delay: param.delay ?? 300,
      isRunning: false,
      name: param.name,
    }
  })

  return paramsChecked
}

type ShouldRunResult =
  | { shouldRun: true; globToWatch: string; param: StateDetail }
  | { shouldRun: false; globToWatch: null; param: null }
function shouldRun(
  absolutePath: string | null,
  watchKind: WatchKind,
  watchAndRunConf: Record<string, StateDetail>
): ShouldRunResult {
  for (const [globToWatch, param] of Object.entries(watchAndRunConf)) {
    const isWatched = param.kind.includes(watchKind)
    const isPathMatching = absolutePath && micromatch.isMatch(absolutePath, globToWatch)
    const isWatchKindWithoutPath = kindWithoutPath.includes(watchKind as KindWithoutPath)
    if (!param.isRunning && isWatched && (isPathMatching || isWatchKindWithoutPath)) {
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
  return `${name ? logMagneta(`[${name}]`) : ''} ${str}`
}

async function watcher(
  absolutePath: string | null,
  watchKind: WatchKind,
  watchAndRunConf: Record<string, StateDetail>
) {
  const shouldRunInfo = shouldRun(absolutePath, watchKind, watchAndRunConf)
  if (shouldRunInfo.shouldRun) {
    watchAndRunConf[shouldRunInfo.globToWatch].isRunning = true

    log.info(
      `${logGreen('✔')} Thx to ${logGreen(shouldRunInfo.globToWatch)}, ` +
        `triggered by ${logCyan(watchKind)} ${absolutePath && logGreen(absolutePath)}, ` +
        `we will wait ${logCyan(shouldRunInfo.param.delay + 'ms')} and run ${logGreen(shouldRunInfo.param.run)}.`
    )

    // Run after a delay
    setTimeout(() => {
      const child = spawn(shouldRunInfo.param.run, [], { shell: true })

      //spit stdout to screen
      child.stdout.on('data', data => {
        process.stdout.write(formatLog(data.toString(), shouldRunInfo.param.name ?? ''))
      })

      //spit stderr to screen
      child.stderr.on('data', data => {
        process.stdout.write(formatLog(data.toString(), shouldRunInfo.param.name ?? ''))
      })

      child.on('close', code => {
        if (code === 0) {
          log.info(`${logGreen('✔')} finished ${logGreen('successfully')}`)
        } else {
          log.error(`finished with some ${logRed('errors')}`)
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
      kindWithPath.forEach((kind: KindWithPath) => {
        const _watcher = async (absolutePath: string) => watcher(absolutePath, kind, watchAndRunConf)
        server.watcher.on(kind, _watcher)
      })

      kindWithoutPath.forEach((kind: KindWithoutPath) => {
        const _watcher = () => watcher(null, kind, watchAndRunConf)
        server.watcher.on(kind, _watcher)
      })
    },
  }
}

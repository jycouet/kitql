import { readdirSync } from 'fs'
import { spawn } from 'node:child_process'
import { green, Log, yellow } from '@kitql/helpers'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'
import { write } from './fs.js'

export type Options = {
  /**
   * run command after file updated
   *
   * @example
   * ```ts
   * 'npm exec prettier ./src/lib/ROUTES.ts -- -w'
   * ```
   */
  post_update_run?: string

  /**
   * @default 'src/lib/ROUTES.ts'
   */
  generated_file_path?: string
}

function generated_file_path(params?: Options) {
  return params?.generated_file_path ?? 'src/lib/ROUTES.ts'
}

// const routes_path = 'src/lib/ROUTES.ts'
const log = new Log('Kit Routes')

const getFiles = (dirPath: string, lookFor: '+page.svelte' | '+page.server.ts' | '+server.ts') => {
  const files = readdirSync(dirPath, { recursive: true }) as string[]
  return files
    .filter(file => file.endsWith(lookFor))
    .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
}

export function extractParamsFromPath(path: string): string[] {
  // Use a regular expression to match parameter placeholders like '[param]'
  const paramPattern = /\[([^\]]+)]/g
  const params = []

  let match
  while ((match = paramPattern.exec(path)) !== null) {
    // The matched parameter name is in the first capturing group
    params.push(match[1])
  }

  return params
}

const run = (params?: Options) => {
  const files_pages = getFiles(`${process.cwd()}/src/routes`, '+page.svelte')
  const files_server_pages = getFiles(`${process.cwd()}/src/routes`, '+page.server.ts')
  const files_server = getFiles(`${process.cwd()}/src/routes`, '+server.ts')

  const result = write(generated_file_path(params), [
    `export const PAGES = {
  ${files_pages
    .map(file_path => {
      const params = extractParamsFromPath(file_path).map(c => `${c}: string`)
      params.push(`sp?: Record<string, string>`)
      return (
        `"${file_path}": (${params.join(', ')}) => ` +
        `{ return \`${file_path.replaceAll('[', '${').replaceAll(']', '}')}\${appendSp(sp)}\` }`
      )
    })
    .join(',\n  ')}
}

// TODO: SERVERS methods?
export const SERVERS = {
  ${files_server
    .map(file_path => {
      const params = extractParamsFromPath(file_path).map(c => `${c}: string`)
      params.push(`sp?: Record<string, string>`)
      return (
        `"${file_path}": (${params.join(', ')}) => ` +
        `{ return \`${file_path.replaceAll('[', '${').replaceAll(']', '}')}\${appendSp(sp)}\` }`
      )
    })
    .join(',\n  ')}
}

// TODO: name actions
export const ACTIONS = {
  ${files_server_pages
    .map(file_path => {
      const params = extractParamsFromPath(file_path).map(c => `${c}: string`)
      return (
        `"${file_path}": (${params.join(', ')}) => ` +
        `{ return \`${file_path.replaceAll('[', '${').replaceAll(']', '}')}\` }`
      )
    })
    .join(',\n  ')}
}

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return \`?\${new URLSearchParams(sp || {}).toString()}\`
}
`,
  ])

  // TODO: optimize this later. We want to write the new file only if different after prettier?! (having a tmp file somewhere?)
  if (params?.post_update_run) {
    log.info(`${yellow(`post_update_run`)} "${green(params?.post_update_run)}" running...`)
    const child = spawn(params.post_update_run, { shell: true })
    child.stdout.on('data', data => {
      if (data.toString()) {
        log.info(data.toString())
      }
    })
    child.stderr.on('data', data => {
      log.error(data.toString())
    })
    child.on('close', code => {
      if (result) {
        log.success(`${yellow(generated_file_path(params))} updated`)
      }
    })
  } else {
    if (result) {
      log.success(`${yellow(generated_file_path(params))} updated`)
    }
  }
}

export function kitRoutes(params?: Options): Plugin[] {
  return [
    // Run the thing at startup
    {
      name: 'kit-routes',
      configureServer() {
        run(params)
      },
    },

    // Run the thing when any change in a +page.svelte (add, remove, ...)
    watch_and_run([
      {
        name: 'kit-routes-watch',
        logs: [],
        watch: ['**/+page.svelte', '**/+page.server.ts', '**/+server.ts'],
        run: () => run(params),
      },
    ]),
  ]
}

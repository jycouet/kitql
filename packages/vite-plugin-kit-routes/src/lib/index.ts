import { readdirSync } from 'fs'
import { Log, yellow } from '@kitql/helpers'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'
import { write } from './fs.js'

export type Options = {}

const routes_path = 'src/lib/ROUTES.ts'
const log = new Log('Kit Routes')

const getFiles = (dirPath: string) => {
  const files = readdirSync(dirPath, { recursive: true }) as string[]
  return files
    .filter(file => file.endsWith('+page.svelte'))
    .map(file => `/` + file.replace('/+page.svelte', '').replace('+page.svelte', ''))
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

const run = () => {
  const files = getFiles(`${process.cwd()}/src/routes`)

  const res = write(routes_path, [
    `export const ROUTES = {
  ${files
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

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return \`?\${new URLSearchParams(sp || {}).toString()}\`
}
`,
  ])
  if (res) {
    log.success(`${yellow(routes_path)} updated`)
  }
}

export function kit_routes(params?: Options): Plugin[] {
  return [
    // Run the thing at startup
    {
      name: 'kit-routes',
      configureServer() {
        run()
      },
    },
    // Run the thing when any change in a +page.svelte (add, remove, ...)
    watch_and_run([
      {
        name: 'kit-routes-watch',
        logs: [],
        watch: '**/+page.svelte',
        run,
      },
    ]),
  ]
}

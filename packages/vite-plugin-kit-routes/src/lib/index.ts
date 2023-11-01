import { readdirSync } from 'fs'
import { spawn } from 'node:child_process'
import { parse } from '@babel/parser'
import { green, Log, yellow } from '@kitql/helpers'
import * as recast from 'recast'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'
import { read, write } from './fs.js'

const { visit } = recast.types

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

  /**
   * when `false` _(default)_, object keys look like this: `site_id_two_hello`
   *
   * when `true`, object keys look like this: `/site/[id]/two/[hello]`
   */
  keep_path_param_format?: boolean
}

function generated_file_path(options?: Options) {
  return options?.generated_file_path ?? 'src/lib/ROUTES.ts'
}

export function formatKey(key: string, options?: Options) {
  if (options?.keep_path_param_format) {
    return key
  }

  const toReplace = ['/', '[', ']', '(', ')', '-']
  let toRet = key
    .split('')
    .map(c => (toReplace.includes(c) ? '_' : c))
    .join('')
    .replaceAll('__', '_')
    .replaceAll('__', '_')
    .replaceAll('__', '_')
  if (toRet.startsWith('_')) {
    toRet = toRet.slice(1)
  }
  if (toRet.endsWith('_')) {
    toRet = toRet.slice(0, -1)
  }

  if (toRet === '') {
    toRet = '_ROOT'
  }

  return toRet
}

function routes_path() {
  return `${process.cwd()}/src/routes`
}

// const routes_path = 'src/lib/ROUTES.ts'
const log = new Log('Kit Routes')

const getFileKeys = (
  lookFor: '+page.svelte' | '+page.server.ts' | '+server.ts',
  options?: Options,
) => {
  const files = readdirSync(routes_path(), { recursive: true }) as string[]
  return (
    files
      .filter(file => file.endsWith(lookFor))
      .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
      // Keep the sorting at this level, it will make more sense
      .sort()
      .map(file => {
        return { toUse: formatKey(file, options), original: file }
      })
  )
}

function formatExtractParamsFromPath(file_path: string) {
  return extractParamsFromPath(file_path).map(c => `${c}: string`)
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

const getMethodsOfServerFiles = (path: string) => {
  const code = read(`${routes_path()}/${path}/${'+server.ts'}`)

  const codeParsed = parse(code ?? '', {
    plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
    sourceType: 'module',
  }).program as recast.types.namedTypes.Program

  let exportedNames: string[] = []
  visit(codeParsed, {
    visitExportNamedDeclaration(path) {
      // @ts-ignore
      const declarations = path.node.declaration?.declarations
      if (declarations) {
        declarations.forEach((declaration: any) => {
          if (declaration.id.name) {
            exportedNames.push(declaration.id.name)
          }
        })
      }
      return false
    },
  })

  return exportedNames
}

const getActionsOfServerPages = (path: string) => {
  const code = read(`${routes_path()}/${path}/${'+page.server.ts'}`)

  const codeParsed = parse(code ?? '', {
    plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
    sourceType: 'module',
  }).program as recast.types.namedTypes.Program

  let exportedNames: string[] = []
  visit(codeParsed, {
    visitExportNamedDeclaration(path) {
      // @ts-ignore
      const declarations = path.node.declaration?.declarations
      if (declarations) {
        declarations.forEach((declaration: any) => {
          if (declaration.id.name === 'actions') {
            const properties = declaration.init.expression.properties
            properties.forEach((property: any) => {
              exportedNames.push(property.key.name)
            })
          }
        })
      }
      return false
    },
  })

  return exportedNames
}

const run = (options?: Options) => {
  const pages = getFileKeys('+page.svelte', options)
  const server = getFileKeys('+page.server.ts', options)
  const files_server = getFileKeys('+server.ts', options)

  const result = write(generated_file_path(options), [
    `export const PAGES = {
  ${pages
    .map(key => {
      const params = []
      const pFormPath = formatExtractParamsFromPath(key.original)
      if (pFormPath.length > 0) {
        params.push(`params: {${pFormPath}}`)
      }
      params.push(`sp?: Record<string, string>`)
      return (
        `"${key.toUse}": (${params.join(', ')}) => ` +
        `{ return \`${key.original
          .replaceAll('[', '${params.')
          .replaceAll(']', '}')}\${appendSp(sp)}\` }`
      )
    })
    .join(',\n  ')}
}

export const SERVERS = {
  ${files_server
    .map(key => {
      const params = []
      const methods = getMethodsOfServerFiles(key.original)
      if (methods.length > 0) {
        params.push(`method: ${methods.map(c => `'${c}'`).join(' | ')}`)
      }
      const pFormPath = formatExtractParamsFromPath(key.original)
      if (pFormPath.length > 0) {
        params.push(`params: {${pFormPath}}`)
      }
      params.push(`sp?: Record<string, string>`)
      return (
        `"${key.toUse}": (${params.join(', ')}) => ` +
        `{ return \`${key.original
          .replaceAll('[', '${params.')
          .replaceAll(']', '}')}\${appendSp(sp)}\` }`
      )
    })
    .join(',\n  ')}
}

export const ACTIONS = {
  ${server
    .map(key => {
      const params = []
      const actions = getActionsOfServerPages(key.original)
      let actionsFormat = ''
      if (actions.length === 0) {
      } else if (actions.length === 1 && actions[0] === 'default') {
      } else {
        params.push(`action: ${actions.map(c => `'${c}'`).join(' | ')}`)
        actionsFormat = `?/\${action}`
        // actionsFormat = `coucou`
      }
      const pFormPath = formatExtractParamsFromPath(key.original)
      if (pFormPath.length > 0) {
        params.push(`params: {${pFormPath}}`)
      }
      return (
        `"${key.toUse}": (${params.join(', ')}) => ` +
        `{ return \`` +
        `${key.original.replaceAll('[', '${params.').replaceAll(']', '}')}` +
        `${actionsFormat}` +
        `\`}`
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
  if (options?.post_update_run) {
    log.info(`${yellow(`post_update_run`)} "${green(options?.post_update_run)}" running...`)
    const child = spawn(options.post_update_run, { shell: true })
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
        log.success(`${yellow(generated_file_path(options))} updated`)
      }
    })
  } else {
    if (result) {
      log.success(`${yellow(generated_file_path(options))} updated`)
    }
  }
}

export function kitRoutes(options?: Options): Plugin[] {
  return [
    // Run the thing at startup
    {
      name: 'kit-routes',
      configureServer() {
        run(options)
      },
    },

    // Run the thing when any change in a +page.svelte (add, remove, ...)
    watch_and_run([
      {
        name: 'kit-routes-watch',
        logs: [],
        watch: ['**/+page.svelte', '**/+page.server.ts', '**/+server.ts'],
        run: () => run(options),
      },
    ]),
  ]
}

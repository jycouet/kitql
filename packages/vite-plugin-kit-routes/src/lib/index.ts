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
}

function generated_file_path(params?: Options) {
  return params?.generated_file_path ?? 'src/lib/ROUTES.ts'
}

function routes_path() {
  return `${process.cwd()}/src/routes`
}

// const routes_path = 'src/lib/ROUTES.ts'
const log = new Log('Kit Routes')

const getFiles = (lookFor: '+page.svelte' | '+page.server.ts' | '+server.ts') => {
  const files = readdirSync(routes_path(), { recursive: true }) as string[]
  return files
    .filter(file => file.endsWith(lookFor))
    .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
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

const run = (params?: Options) => {
  const files_pages = getFiles('+page.svelte')
  const files_server_pages = getFiles('+page.server.ts')
  const files_server = getFiles('+server.ts')

  const result = write(generated_file_path(params), [
    `export const PAGES = {
  ${files_pages
    .map(file_path => {
      const params = []
      const pFormPath = formatExtractParamsFromPath(file_path)
      if (pFormPath.length > 0) {
        params.push(`params: {${pFormPath}}`)
      }
      params.push(`sp?: Record<string, string>`)
      return (
        `"${file_path}": (${params.join(', ')}) => ` +
        `{ return \`${file_path
          .replaceAll('[', '${params.')
          .replaceAll(']', '}')}\${appendSp(sp)}\` }`
      )
    })
    .join(',\n  ')}
}

export const SERVERS = {
  ${files_server
    .map(file_path => {
      const params = []
      params.push(
        `method: ${getMethodsOfServerFiles(file_path)
          .map(c => `'${c}'`)
          .join(' | ')}`,
      )
      const pFormPath = formatExtractParamsFromPath(file_path)
      if (pFormPath.length > 0) {
        params.push(`params: {${pFormPath}}`)
      }
      params.push(`sp?: Record<string, string>`)
      return (
        `"${file_path}": (${params.join(', ')}) => ` +
        `{ return \`${file_path
          .replaceAll('[', '${params.')
          .replaceAll(']', '}')}\${appendSp(sp)}\` }`
      )
    })
    .join(',\n  ')}
}

export const ACTIONS = {
  ${files_server_pages
    .map(file_path => {
      const params = []
      const actions = getActionsOfServerPages(file_path)
      let actionsSpecified = false
      if (actions.length === 0) {
        // Don't do anything...
      } else if (actions.length === 1 && actions[0] === 'default') {
        // Don't do anything...
      } else {
        params.push(`action: ${actions.map(c => `'${c}'`).join(' | ')}`)
        actionsSpecified = true
      }
      const pFormPath = formatExtractParamsFromPath(file_path)
      if (pFormPath.length > 0) {
        params.push(`params: {${pFormPath}}`)
      }
      return (
        `"${file_path}": (${params.join(', ')}) => ` +
        `{ return \`${file_path.replaceAll('[', '${params.').replaceAll(']', '}')}` +
        `${actionsSpecified ? `\${String(action) === 'default' ? '' : \`?/\${action}\`}` : ``}\` }`
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

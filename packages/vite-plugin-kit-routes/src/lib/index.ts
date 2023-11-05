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

  /**
   * when `false` _(default)_, paths doesn't get a last argument to set extra search params
   *
   * when `true`, each paths get an extra arg for open search param
   *
   * Can be tuned at individual path level
   */
  allow_extra_search_params?: boolean
}

function generated_file_path(options?: Options) {
  return options?.generated_file_path ?? 'src/lib/ROUTES.ts'
}

export function formatKey(key: string, options?: Options) {
  if (options?.keep_path_param_format) {
    return key
  }

  const toReplace = ['/', '[', ']', '(', ')', '-', '=']
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
  withAppendSp?: boolean,
) => {
  const useWithAppendSp = withAppendSp && options?.allow_extra_search_params
  console.log(`withAppendSp`, lookFor, withAppendSp, useWithAppendSp)
  const files = readdirSync(routes_path(), { recursive: true }) as string[]
  return (
    files
      .filter(file => file.endsWith(lookFor))
      .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
      // Keep the sorting at this level, it will make more sense
      .sort()
      .map(original => {
        const href = original.replace(/\([^)]*\)/g, '').replace(/\/+/g, '/')
        let toRet = href

        const toUse = formatKey(original, options)

        const paramsFromPath = extractParamsFromPath(original)
        paramsFromPath.params.forEach(c => {
          const sMatcher = `${c.matcher ? `=${c.matcher}` : ''}`
          if (c.optional) {
            toRet = toRet.replaceAll(`[[${c.name + sMatcher}]]`, `\${params?.${c.name} ?? ''}`)
          } else {
            toRet = toRet.replaceAll(`[${c.name + sMatcher}]`, `\${params.${c.name}}`)
          }
        })

        const params = []

        let actionsFormat = ''
        if (lookFor === '+server.ts') {
          const methods = getMethodsOfServerFiles(original)
          if (methods.length > 0) {
            params.push(`method: ${methods.map(c => `'${c}'`).join(' | ')}`)
          }
        } else if (lookFor === '+page.server.ts') {
          const actions = getActionsOfServerPages(original)

          if (actions.length === 0) {
          } else if (actions.length === 1 && actions[0] === 'default') {
          } else {
            params.push(`action: ${actions.map(c => `'${c}'`).join(' | ')}`)
            actionsFormat = `?/\${action}`
          }
        }

        if (paramsFromPath.params.length > 0) {
          params.push(
            `params${paramsFromPath.isAllOptional ? '?' : ''}: {${paramsFromPath.formatArgs}}`,
          )
        }
        if (useWithAppendSp) {
          params.push(`sp?: Record<string, string | number>`)
        }
        const prop =
          `"${toUse}": (${params.join(', ')}) => ` +
          ` { return \`${toRet}${actionsFormat}${useWithAppendSp ? `\${appendSp(sp)}` : ``}\` }`

        return { prop }
      })
  )
}

export function extractParamsFromPath(path: string): {
  params: { name: string; optional: boolean; matcher?: string }[]
  formatArgs: string[]
  isAllOptional: boolean
} {
  const paramPattern = /\[+([^\]]+)]+/g
  const params = []

  let match
  while ((match = paramPattern.exec(path)) !== null) {
    // Check if it's surrounded by double brackets indicating an optional parameter
    const isOptional = match[0].startsWith('[[')
    const matcher = match[1].split('=')
    if (matcher.length === 2) {
      params.push({
        // name: `${matcher[0]}_${matcher[1]}`,
        name: matcher[0],
        optional: isOptional,
        matcher: matcher[1],
      })
    } else {
      params.push({ name: match[1], optional: isOptional })
    }
  }

  const format = params.map(c => `${c.name}${c.optional ? '?' : ''}: string | number`)
  const isAllOptional = params.filter(c => !c.optional).length === 0
  return { params, formatArgs: format, isAllOptional }
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
  const pages = getFileKeys('+page.svelte', options, true)
  const servers = getFileKeys('+server.ts', options, true)
  const pages_server = getFileKeys('+page.server.ts', options, false)

  const result = write(generated_file_path(options), [
    `export const PAGES = {
  ${pages.map(key => key.prop).join(',\n  ')}
}

export const SERVERS = {
  ${servers.map(key => key.prop).join(',\n  ')}
}

export const ACTIONS = {
  ${pages_server.map(key => key.prop).join(',\n  ')}
}

const appendSp = (sp?: Record<string, string | number>) => {
  if (sp === undefined) return ''
  return \`?\${new URLSearchParams(sp as Record<string, string> || {}).toString()}\`
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

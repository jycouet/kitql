import { parse } from '@babel/parser'
import { green, Log, red, yellow } from '@kitql/helpers'
import { spawn } from 'node:child_process'
import * as recast from 'recast'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'

import { getFilesUnder, read, write } from './fs.js'

const { visit } = recast.types

type ExtendTypes = {
  PAGES: Record<string, string>
  SERVERS: Record<string, string>
  ACTIONS: Record<string, string>
  Params: Record<string, string>
}

type LogKind = 'update' | 'post_update_run' | 'errors'

export type Options<T extends ExtendTypes = ExtendTypes> = {
  /**
   * run any command after an update of some routes.
   *
   * @example
   * ```ts
   * 'npm exec prettier ./src/lib/ROUTES.ts -- -w'
   * ```
   */
  post_update_run?: string

  /**
   * by default, everything is logged. If you want to remove them, send an empty array.
   * If you want only `update` logs, give `['update']`
   */
  logs?: LogKind[]

  /**
   * @default 'src/lib/ROUTES.ts'
   */
  generated_file_path?: string

  /**
   * ```ts
   * // when `/` (default) you can use:
   * PAGES["/site/[id]/two/[hello]"]
   *
   * // when `_` you can use:
   * PAGES.site_id_two_hello
   * ```
   */
  format?: '/' | '_' | 'variables'

  /**
   * default is: `string | number`
   */
  default_type?: string

  /**
   * when `without` _(default)_, paths doesn't get a last argument to set extra search params
   *
   * when `with`, each paths get an extra arg for open search param
   *
   * ⚠️ **We don't recommend to use it, but it can be useful in some cases.**
   *
   * Can be tuned at individual path level
   */
  extra_search_params?: 'with' | 'without'

  PAGES?: Partial<{ [K in keyof T['PAGES']]: CustomPath<Extract<T['PAGES'][K], string>> }>
  SERVERS?: Partial<{ [K in keyof T['SERVERS']]: CustomPath<Extract<T['SERVERS'][K], string>> }>
  ACTIONS?: Partial<{ [K in keyof T['ACTIONS']]: CustomPath<Extract<T['ACTIONS'][K], string>> }>
  /**
   * ```ts
   * {
   *   // ... Example ...
   *   LINKS: {
   *    // reference to a hardcoded link
   *    twitter: 'https://twitter.com/jycouet',
   *    // ✅ <a href={LINKS.twitter}>Twitter</a>
   *
   *    // reference to link with params! (Like svelteKit routes add [ ] to specify params)
   *    twitter_post: 'https://twitter.com/[name]/status/[id]',
   *    // ✅ <a href={LINKS.twitter_post({ name: 'jycouet', id: '1727089217707159569' })}>Twitter Post</a>
   *
   *    // reference to link with params & search params!
   *    gravatar: {
   *      href: 'https://www.gravatar.com/avatar/[str]',
   *      explicit_search_params: {
   *        s: { type: 'number', default: 75 },
   *        d: { type: '"retro" | "identicon"', default: '"identicon"' },
   *      },
   *    },
   *    // ✅ <img src={LINKS.gravatar({ str: 'jycouet', s: 20 })} alt="logo" />
   *  }
   * }
   * ```
   */
  LINKS?: Record<string, string | ({ href: string } & CustomPath<string>)>

  /**
   * To override the type of a param globally.
   */
  override_params?: Partial<{ [K in keyof T['Params']]: OverrideParam }>
}

export type CustomPath<Params extends string | never = string> = {
  /**
   * Add to this route an explicit search params (with some options)
   * @example
   * explicit_search_params {
   *   limit: {                   // name of the search param
   *     required?: true | false, // default: false
   *     type: 'number',          // default: 'string | number'
   *     default: 12,             // default: undefined
   *   }
   * }
   */
  explicit_search_params?: Record<string, ExplicitSearchParam>
  /**
   * Specify for this route the type & a default.
   * @example
   * params {
   *   id: {                   // name of the param (if you set the plugin `kitRoutes<KIT_ROUTES>`, it will be typed!)
   *     type: 'number',       // default: 'string | number'
   *     default: 12,          // default: undefined
   *   }
   * }
   */
  params?: Partial<Record<Params, ExtendParam>>
  /**
   * If `with`, you can add extra search params to this route (without any typecheck!)
   *
   * ⚠️ **We don't recommend to use it, but it can be useful in some cases.**
   */
  extra_search_params?: 'default' | 'with' | 'without'
}

export type OverrideParam = {
  type: string
  // default?: string //TODO one day?
}

export type ExtendParam = {
  type?: string
  /**
   * You have to double escape strings.
   *
   * @example
   * { type: 'number', default: 75 }
   * of
   * { type: 'string', default: '"jycouet"' }
   */
  default?: any
}

export type ExplicitSearchParam = ExtendParam & {
  required?: boolean
}

function generated_file_path(options?: Options) {
  return options?.generated_file_path ?? 'src/lib/ROUTES.ts'
}

export function rmvGroups(key: string) {
  let toRet = key
    // rmv (groups)
    .replace(/\([^)]*\)/g, '')
    .replace(/\/+/g, '/')
  return toRet
}

export function formatKey(key: string, options?: Options) {
  let toRet = rmvGroups(key)

  if (options?.format === undefined || options?.format === '/') {
    return toRet
  }

  const toReplace = ['/', '[', ']', '(', ')', '-', '=']
  toRet = toRet
    .split('')
    .map(c => (toReplace.includes(c) ? '_' : c))
    .join('')
    .replaceAll('...', '')
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
  files: string[],
  type: 'PAGES' | 'SERVERS' | 'ACTIONS' | 'LINKS',
  options?: Options,
  withAppendSp?: boolean,
) => {
  const useWithAppendSp = withAppendSp && options?.extra_search_params === 'with'

  if (type === 'LINKS') {
    const toRet = Object.entries(options?.LINKS ?? {}).map(c => {
      const hrefToUse = typeof c[1] === 'string' ? c[1] : c[1].href

      return fileToMetadata(c[0], hrefToUse, type, options, useWithAppendSp)
    })
    return toRet.filter(c => c !== null) as {
      keyToUse: string
      prop: string
      paramsFromPath: Param[]
    }[]
  }

  const lookFor =
    type === 'PAGES' ? '+page.svelte' : type === 'SERVERS' ? '+server.ts' : '+page.server.ts'

  // For windows
  files = files.map(c => c.replaceAll('\\', '/'))

  const toRet = files
    .filter(file => file.endsWith(lookFor))
    .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
    // Keep the sorting at this level, it will make more sense
    .sort()
    .map(original => fileToMetadata(original, original, type, options, useWithAppendSp))

  return toRet.filter(c => c !== null) as {
    keyToUse: string
    prop: string
    paramsFromPath: Param[]
  }[]
}

type Param = {
  name: string
  optional: boolean
  matcher?: string
  type?: string
  default?: any
  fromPath?: boolean
  isArray: boolean
}

export const fileToMetadata = (
  original: string,
  originalValue: string,
  type: 'PAGES' | 'SERVERS' | 'ACTIONS' | 'LINKS',
  options: Options | undefined,
  useWithAppendSp: boolean | undefined,
) => {
  const keyToUse = formatKey(original, options)
  let toRet = rmvGroups(originalValue)

  // custom conf
  const viteCustomPathConfig = options?.[type]
  let customConf: CustomPath = {
    extra_search_params: 'default',
  }
  if (viteCustomPathConfig && viteCustomPathConfig[keyToUse]) {
    // @ts-expect-error
    customConf = viteCustomPathConfig[keyToUse]
  }

  const paramsFromPath = extractParamsFromPath(originalValue)

  // custom Param?
  if (customConf.params) {
    Object.entries(customConf.params).forEach(sp => {
      for (let i = 0; i < paramsFromPath.length; i++) {
        if (paramsFromPath[i].name === sp[0]) {
          if (sp[1] && sp[1].type) {
            paramsFromPath[i].type = sp[1].type
          }
          if (sp[1] && sp[1].default !== undefined) {
            paramsFromPath[i].default = sp[1].default
            // It's becoming optional because it has a default
            paramsFromPath[i].optional = true
          }
        }
      }
    })
  }

  paramsFromPath.forEach((c, i) => {
    const sMatcher = `${c.matcher ? `=${c.matcher}` : ''}`

    // Very special case
    if (toRet === `/[[${c.name + sMatcher}]]`) {
      toRet = `\${params?.${c.name} ? \`/\${params?.${c.name}}\`: '/'}`
    } else {
      // Always 2 cases, with "/" prefix and without
      const cases = ['/', '']
      // First -> optionnals
      cases.forEach(prefix => {
        toRet = toRet.replaceAll(
          `${prefix}[[${c.name + sMatcher}]]`,
          `\${params?.${c.name} ? \`${prefix}\${params?.${c.name}}\`: ''}`,
        )
      })

      // Second -> params
      cases.forEach(prefix => {
        toRet = toRet.replaceAll(`${prefix}[${c.name + sMatcher}]`, `${prefix}\${params.${c.name}}`)
      })

      // Third -> [...rest]
      cases.forEach(prefix => {
        toRet = toRet.replaceAll(
          `${prefix}[...${c.name + sMatcher}]`,
          `${prefix}\${params.${c.name}?.join('/')}`,
        )
      })
    }
  })

  const params = []

  let actionsFormat = ''
  if (type === 'SERVERS') {
    const methods = getMethodsOfServerFiles(originalValue)
    if (methods.length > 0) {
      params.push(`method: ${methods.map(c => `'${c}'`).join(' | ')}`)
    }
  } else if (type === 'ACTIONS') {
    const { actions } = getActionsOfServerPages(originalValue)

    if (actions.length === 0) {
      return null
    } else if (actions.length === 1 && actions[0] === 'default') {
    } else {
      params.push(`action: ${actions.map(c => `'${c}'`).join(' | ')}`)
      actionsFormat = `?/\${action}`
    }
  }

  // custom search Param?
  const explicit_search_params_to_function: string[] = []
  if (customConf.explicit_search_params) {
    Object.entries(customConf.explicit_search_params).forEach(sp => {
      paramsFromPath.push({
        name: sp[0],
        optional: !sp[1].required,
        type: sp[1].type,
        default: sp[1].default,
        isArray: false,
      })
      explicit_search_params_to_function.push(`${sp[0]}: params.${sp[0]}`)
    })
  }

  if (paramsFromPath.length > 0) {
    const isAllOptional = paramsFromPath.filter(c => !c.optional).length === 0
    params.push(
      `params: {${formatArgs(paramsFromPath, options)}}` + `${isAllOptional ? '= {}' : ''}`,
    )
  }

  let fullSP = ''
  const wExtraSP =
    (customConf.extra_search_params === 'default' && useWithAppendSp) ||
    customConf.extra_search_params === 'with'

  if (wExtraSP && !customConf.explicit_search_params) {
    params.push(`sp?: Record<string, string | number>`)
    fullSP = `\${appendSp(sp)}`
  } else if (wExtraSP && customConf.explicit_search_params) {
    params.push(`sp?: Record<string, string | number>`)
    fullSP = `\${appendSp({...sp, ${explicit_search_params_to_function.join(', ')} })}`
  } else if (!wExtraSP && customConf.explicit_search_params) {
    fullSP = `\${appendSp({ ${explicit_search_params_to_function.join(', ')} })}`
  }

  let paramsDefaults = paramsFromPath
    .filter(c => c.default !== undefined)
    .map(c => {
      return `params.${c.name} = params.${c.name} ?? ${c.default}; `
    })

  let prop = ''
  if (params.length > 0) {
    prop =
      `"${keyToUse}": (${params.join(', ')}) => ` +
      ` {${paramsDefaults.length > 0 ? `\n    ${paramsDefaults.join('\n    ')}` : ''}
        return \`${toRet}${actionsFormat}${fullSP}\`
      }`
  } else {
    prop = `"${keyToUse}": \`${toRet}\``
  }

  return { keyToUse, prop, paramsFromPath }
}

export function extractParamsFromPath(path: string): Param[] {
  const paramPattern = /\[+([^\]]+)]+/g
  const params: Param[] = []

  let match
  while ((match = paramPattern.exec(path)) !== null) {
    // Check if it's surrounded by double brackets indicating an optional parameter
    const isOptional = match[0].startsWith('[[')
    const isArray = match[0].includes('...')
    const matcher = match[1].split('=')
    if (matcher.length === 2) {
      params.push({
        name: matcher[0].replace('...', ''),
        optional: isOptional,
        matcher: matcher[1],
        fromPath: true,
        isArray,
      })
    } else {
      params.push({
        name: match[1].replace('...', ''),
        optional: isOptional,
        fromPath: true,
        isArray,
      })
    }
  }

  return params
}

const formatArgs = (params: Param[], options?: Options) => {
  return params
    .map(c => {
      const override_params = Object.entries(options?.override_params ?? {}).filter(
        d => d[0] === c.name,
      )

      let override_param = undefined
      if (override_params.length > 0) {
        override_param = override_params[0][1]?.type
      }

      return (
        `${c.name}${c.optional ? '?' : ''}: ` +
        `(${c.type ?? override_param ?? options?.default_type ?? 'string | number'})` +
        `${c.isArray ? '[]' : ''}`
      )
    })
    .join(', ')
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

      // Check for export specifiers (for aliased exports)
      const specifiers = path.node.specifiers
      if (specifiers) {
        specifiers.forEach((specifier: any) => {
          if (specifier.exported.name) {
            exportedNames.push(specifier.exported.name)
          }
        })
      }

      return false
    },
  })

  return exportedNames
}

const getActionsOfServerPages = (pathFile: string) => {
  const code = read(`${routes_path()}/${pathFile}/${'+page.server.ts'}`)

  let withLoad = false

  const codeParsed = parse(code ?? '', {
    plugins: ['typescript', 'importAssertions', 'decorators-legacy'],
    sourceType: 'module',
  }).program as recast.types.namedTypes.Program

  let actions: string[] = []
  visit(codeParsed, {
    visitExportNamedDeclaration(path) {
      // @ts-ignore
      const declarations = path.node.declaration?.declarations
      if (declarations) {
        declarations.forEach((declaration: any) => {
          if (declaration.id.name === 'actions') {
            const properties = declaration.init.expression?.properties
            if (properties) {
              properties.forEach((property: any) => {
                actions.push(property.key.name)
              })
            }
          }
          if (declaration.id.name === 'load') {
            withLoad = true
          }
        })
      }
      return false
    },
  })

  // TODO: withLoad to be used one day? with PAGE_SERVER_LOAD? PAGE_LOAD?
  return { actions, withLoad }
}

const shouldLog = (kind: LogKind, options?: Options) => {
  if (options?.logs === undefined) {
    // let's log everything by default
    return true
  }
  return options.logs.includes(kind)
}

export const run = (options?: Options) => {
  let files = getFilesUnder(routes_path())

  // TODO check if harcoded links are around?
  // for (let i = 0; i < files.length; i++) {
  // goto, href, action, src, throw redirect?
  // }

  const objTypes = [
    { type: 'PAGES', files: getFileKeys(files, 'PAGES', options, true) },
    { type: 'SERVERS', files: getFileKeys(files, 'SERVERS', options, true) },
    { type: 'ACTIONS', files: getFileKeys(files, 'ACTIONS', options, false) },
    { type: 'LINKS', files: getFileKeys(files, 'LINKS', options, false) },
  ] as const

  // Validate options
  let allOk = true
  objTypes
    .filter(c => c.type !== 'LINKS')
    .forEach(o => {
      Object.entries(options?.[o.type] ?? {}).forEach(e => {
        const [key, cPath] = e
        const found = o.files.find(c => c.keyToUse === key)
        if (!found) {
          if (shouldLog('errors', options)) {
            log.error(
              `Can't extend "${green(`${o.type}.`)}${red(key)}" as this path doesn't exist!`,
            )
          }
          allOk = false
        } else {
          if (cPath) {
            Object.entries(cPath.params ?? {}).forEach(p => {
              const [pKey] = p
              const paramsFromPathFound = found.paramsFromPath.find(c => c.name === pKey)
              if (!paramsFromPathFound) {
                if (shouldLog('errors', options)) {
                  log.error(
                    `Can't extend "${green(`${o.type}.${key}.params.`)}${red(
                      pKey,
                    )}" as this param doesn't exist!`,
                  )
                }
                allOk = false
              }
            })
          }
        }
      })
    })

  if (allOk) {
    const result = write(generated_file_path(options), [
      `/** 
 * This file was generated by 'vite-plugin-kit-routes'
 * 
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */
`,
      // consts
      options?.format === 'variables'
        ? objTypes
            .map(c => {
              return c.files
                .map(key => {
                  const [first, ...rest] = key.prop.split(':')

                  return `export const ${c.type}_${first.slice(1, -1)} = ${rest.join(':')}`
                })
                .join('\n')
            })
            .join(`\n\n`)
        : objTypes
            .map(c => {
              return `export const ${c.type} = {
  ${c.files.map(key => key.prop).join(',\n  ')}
}`
            })
            .join(`\n\n`),
      `
const appendSp = (sp?: Record<string, string | number | undefined>) => {
  if (sp === undefined) return ''
  const mapping = Object.entries(sp)
    .filter(c => c[1] !== undefined)
    .map(c => [c[0], String(c[1])])

  const formated = new URLSearchParams(mapping).toString()
  if (formated) {
    return \`?\${formated}\`
  }
  return ''
}

`, // types
      `/**
* Add this type as a generic of the vite plugin \`kitRoutes<KIT_ROUTES>\`.
* 
* Full example:
* \`\`\`ts
* import type { KIT_ROUTES } from '$lib/ROUTES'
* import { kitRoutes } from 'vite-plugin-kit-routes'
* 
* kitRoutes<KIT_ROUTES>({
*  PAGES: {
*    // here, "paths" it will be typed!
*  }
* })
* \`\`\`
*/
export type KIT_ROUTES = { 
${objTypes
  .map(c => {
    return `  ${c.type}: { ${c.files
      .map(d => {
        return `'${d.keyToUse}': ${
          d.paramsFromPath.filter(e => e.fromPath === true).length === 0
            ? 'never'
            : d.paramsFromPath
                .filter(e => e.fromPath === true)
                .map(e => {
                  return `'${e.name}'`
                })
                .join(' | ')
        }`
      })
      .join(', ')} }`
  })
  .join('\n')}
  Params: { ${[
    ...new Set(
      objTypes.flatMap(c => c.files.flatMap(d => d.paramsFromPath.map(e => `${e.name}: never`))),
    ),
  ].join(', ')} }
}
`,
    ])

    // TODO: optimize this later. We want to write the new file only if different after prettier?! (having a tmp file somewhere?)
    if (options?.post_update_run) {
      if (shouldLog('post_update_run', options)) {
        log.info(`${yellow(`post_update_run`)} "${green(options?.post_update_run)}" running...`)
      }

      // do the stuff
      const child = spawn(options.post_update_run, { shell: true })

      // report things
      if (shouldLog('post_update_run', options)) {
        child.stdout.on('data', data => {
          if (data.toString()) {
            log.info(data.toString())
          }
        })
      }

      // report errors
      if (shouldLog('errors', options)) {
        child.stderr.on('data', data => {
          log.error(data.toString())
        })
      }

      if (shouldLog('update', options)) {
        child.on('close', code => {
          if (result) {
            log.success(`${yellow(generated_file_path(options))} updated`)
            // TODO later
            // log.info(
            //   `⚠️ Warning ${yellow(`href="/about"`)} detected ` +
            //     `in ${gray('/src/lib/component/menu.svelte')} is not safe. ` +
            //     `You could use: ${green(`href={PAGES['/about']}`)}`,
            // )
            // log.info(
            //   `⚠️ Warning ${yellow(`action="?/save"`)} detected ` +
            //     `in ${gray('/routes/card/+page.svelte')} is not safe. ` +
            //     `You could use: ${green(`href={ACTION['/card']('save')}`)}`,
            // )
          }
        })
      }
    } else {
      if (result) {
        if (shouldLog('update', options)) {
          log.success(`${yellow(generated_file_path(options))} updated`)
        }
      }
    }
    return true
  }

  return false
}

/**
 * First you can start with something simple:
 * ```ts
 * import { kitRoutes } from 'vite-plugin-kit-routes'
 *
 * kitRoutes({
 *  // Conf
 * })
 * ```
 * ---
 * Then, you can add the `ROUTES` type... It will be crazy good!
 * ```ts
 * import type { ROUTES } from '$lib/ROUTES'
 * import { kitRoutes } from 'vite-plugin-kit-routes'
 *
 * kitRoutes<ROUTES>({
 *  // Conf
 * })
 * ```
 */
export function kitRoutes<T extends ExtendTypes = ExtendTypes>(options?: Options<T>): Plugin[] {
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
        run: () => {
          run(options)
        },
      },
    ]),
  ]
}

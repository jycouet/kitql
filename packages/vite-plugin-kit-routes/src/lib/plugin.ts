import { cyan, gray, green, italic, Log, red, stry0, yellow } from '@kitql/helpers'
import { spawn } from 'child_process'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'

import { getActionsOfServerPages, getMethodsOfServerFiles } from './ast.js'
import { appendSp, format, routeFn } from './format.js'
import { getFilesUnder, write } from './fs.js'

type ExtendTypes = {
  PAGES: Record<string, string>
  SERVERS: Record<string, string>
  ACTIONS: Record<string, string>
  Params: Record<string, string>
}

type LogKind = 'update' | 'post_update_run' | 'errors' | 'stats'
type FormatKind = 'route(path)' | 'route(symbol)' | 'variables' | 'object[path]' | 'object[symbol]'

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
   * // format: route(path)        -> default <-
   * route("/site/[id]", { id: 7, tab: 'info' })
   *
   * // format: route(symbol)
   * route("site_id", { id: 7, tab: 'info' })
   *
   * // format: `variables` (best for code splitting & privacy)
   * PAGE_site_id({ id: 7, tab: 'info' })
   *
   * // format: object[path]
   * PAGES["/site/[id]"]({ id: 7, tab: 'info' })
   *
   * // format: object[symbol]
   * PAGES.site_id({ id: 7, tab: 'info' })
   * ```
   */
  format?: FormatKind

  /**
   * default is: `false`
   *
   * If you have only 1 required param, it will be the seond param.
   *
   * ```ts
   * route("/site/[id]", 7)
   * route("site_id", 7)
   * PAGE_site_id(7)
   * PAGES["/site/[id]"](7)
   * PAGES.site_id(7)
   * ```
   */
  params_always_as_object?: boolean

  /**
   * default is: `string | number`
   */
  default_type?: string

  /**
   * In case you have set a `base` in your `svelte.config.js`, you can set `path_base: true`
   * to have it in your routes.
   *
   * FYI, in your `svelte.config.js`:
   * ```js
   * const config = {
   *   kit: {
   *     adapter: adapter(),
   *     paths: {
   *       base: '/yop',
   *     }
   *   }
   * }
   *
   * export default config
   * ```
   *
   * @default false
   */
  path_base?: boolean

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

export const log = new Log('Kit Routes')

export function routes_path() {
  return `${process.cwd()}/src/routes`
}

export function rmvGroups(key: string) {
  let toRet = key
    // rmv (groups)
    .replace(/\([^)]*\)/g, '')
    .replace(/\/+/g, '/')
  return toRet
}

export function rmvOptional(key: string) {
  let toRet = key
    // rmv (Optional)
    .replace(/\[{2}.*?\]{2}/g, '')
  return toRet
}

export function formatKey(key: string, o: Options) {
  const options = getDefaultOption(o)
  let toRet = rmvGroups(rmvOptional(key))

  if (options.format!.includes('path')) {
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

type MetadataToWrite = {
  keyToUse: string
  key_wo_prefix: string
  // prop: string
  paramsFromPath: Param[]
  strDefault: string
  strReturn: string
  strParams: string
}

type KindOfObject = 'PAGES' | 'SERVERS' | 'ACTIONS' | 'LINKS'

const getMetadata = (files: string[], type: KindOfObject, o: Options, withAppendSp?: boolean) => {
  const options = getDefaultOption(o)
  const useWithAppendSp = withAppendSp && options?.extra_search_params === 'with'

  if (type === 'LINKS') {
    const toRet = Object.entries(options?.LINKS ?? {}).flatMap(c => {
      const hrefToUse = typeof c[1] === 'string' ? c[1] : c[1].href
      return transformToMetadata(c[0], hrefToUse, type, options, useWithAppendSp)
    })
    return toRet.filter(c => c !== null) as MetadataToWrite[]
  }

  const lookFor =
    type === 'PAGES' ? '+page.svelte' : type === 'SERVERS' ? '+server.ts' : '+page.server.ts'

  // For windows
  files = files.map(c => c.replaceAll('\\', '/'))

  // remove the layout info
  files = files.map(c => c.replace(/@[^.]*\./, '.'))

  const toRet = files
    .filter(file => file.endsWith(lookFor))
    .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
    // Keep the sorting at this level, it will make more sense
    .sort()
    .flatMap(original => transformToMetadata(original, original, type, options, useWithAppendSp))

  return toRet.filter(c => c !== null) as MetadataToWrite[]
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

export const transformToMetadata = (
  original: string,
  originalValue: string,
  type: KindOfObject,
  options: Options,
  useWithAppendSp: boolean | undefined,
): MetadataToWrite[] => {
  const keyToUse = formatKey(original, options)
  let toRet = rmvGroups(originalValue)

  const list: MetadataToWrite[] = []

  const getSep = () => {
    return options?.format?.includes('route') || options?.format?.includes('path') ? ` ` : `_`
  }

  if (type === 'ACTIONS') {
    const { actions } = getActionsOfServerPages(originalValue)
    if (actions.length === 0) {
    } else if (actions.length === 1 && actions[0] === 'default') {
      list.push(
        buildMetadata(
          type,
          originalValue,
          'default' + getSep() + keyToUse,
          keyToUse,

          useWithAppendSp,
          '',
          toRet,
          options,
        ),
      )
    } else {
      actions.map(action => {
        list.push(
          buildMetadata(
            type,
            originalValue,
            action + getSep() + keyToUse,
            keyToUse,

            useWithAppendSp,
            `?/${action}`,
            toRet,
            options,
          ),
        )
      })
    }
  } else if (type === 'SERVERS') {
    const methods = getMethodsOfServerFiles(originalValue)
    if (methods.length === 0) {
      return []
    } else {
      methods.map(method => {
        list.push(
          buildMetadata(
            type,
            originalValue,
            method + getSep() + keyToUse,
            keyToUse,

            useWithAppendSp,
            ``,
            toRet,
            options,
          ),
        )
      })
    }
  } else {
    list.push(
      buildMetadata(
        type,
        originalValue,
        keyToUse,
        keyToUse,

        useWithAppendSp,
        '',
        toRet,
        options,
      ),
    )
  }

  return list
}

export function buildMetadata(
  type: KindOfObject,
  originalValue: string,
  keyToUse: string,
  key_wo_prefix: string,
  useWithAppendSp: boolean | undefined,
  actionsFormat: string,
  toRet: string,
  o: Options,
) {
  const options = getDefaultOption(o)
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
      explicit_search_params_to_function.push(`${sp[0]}: params?.${sp[0]}`)
    })
  }

  const isAllOptional = paramsFromPath.filter(c => !c.optional).length === 0
  if (paramsFromPath.length > 0) {
    params.push(`params${isAllOptional ? '?' : ''}: { ${formatArgs(paramsFromPath, options)} }`)
  }

  let fullSP = ''
  const wExtraSP =
    (customConf.extra_search_params === 'default' && useWithAppendSp) ||
    customConf.extra_search_params === 'with'

  const appendSpPrefix = actionsFormat ? `, '&'` : ''
  if (wExtraSP && !customConf.explicit_search_params) {
    params.push(`sp?: Record<string, string | number>`)
    fullSP = `\${appendSp(sp${appendSpPrefix})}`
  } else if (wExtraSP && customConf.explicit_search_params) {
    params.push(`sp?: Record<string, string | number>`)
    fullSP =
      `\${appendSp({ ${explicit_search_params_to_function.join(', ')}` +
      `, ...sp }${appendSpPrefix})}`
  } else if (!wExtraSP && customConf.explicit_search_params) {
    fullSP = `\${appendSp({ ${explicit_search_params_to_function.join(', ')} }${appendSpPrefix})}`
  }

  let paramsDefaults = paramsFromPath
    .filter(c => c.default !== undefined)
    .map(c => {
      return `params.${c.name} = params.${c.name} ?? ${c.default}; `
    })

  if (paramsDefaults.length > 0 && isAllOptional) {
    paramsDefaults = ['params = params ?? {}', ...paramsDefaults]
  }

  const pathBaesStr = options?.path_base ? '${base}' : ''
  const strDefault = paramsDefaults.length > 0 ? `${paramsDefaults.join('\n')}` : ''
  const strReturn = `\`${pathBaesStr}${toRet}${actionsFormat}${fullSP}\``
  const strParams = params.join(', ')

  const baseToReturn: MetadataToWrite = {
    keyToUse,
    key_wo_prefix,
    // prop,
    paramsFromPath,
    strDefault,
    strReturn,
    strParams,
  }

  return baseToReturn
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

const formatArgs = (params: Param[], o: Options) => {
  const options = getDefaultOption(o)
  return params
    .sort((a, b) => {
      // if (a.optional === b.optional) {
      //   // When 'optional' is the same, sort by 'name'
      //   return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      // }
      // Otherwise, sort by 'optional'
      // Let's sort only by 'optional' at the end.
      return a.optional < b.optional ? -1 : 1
    })
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

const shouldLog = (kind: LogKind, o: Options) => {
  const options = getDefaultOption(o)
  if (options?.logs === undefined) {
    // let's log everything by default
    return true
  }
  return options.logs.includes(kind)
}

export const getDefaultOption = (o?: Options) => {
  const options = {
    ...o,
    format: o?.format ?? 'route(path)',
    generated_file_path: o?.generated_file_path ?? 'src/lib/ROUTES.ts',
  }
  return options
}

const arrayToRecord = (arr?: string[]) => {
  if (arr && arr.length > 0) {
    return `: { ${arr.join(', ')} }`
  }
  return `: Record<string, never>`
}

export const run = (o?: Options) => {
  const options = getDefaultOption(o)

  let files = getFilesUnder(routes_path())

  // TODO check if harcoded links are around?
  // for (let i = 0; i < files.length; i++) {
  // goto, href, action, src, throw redirect?
  // }

  const objTypes: { type: KindOfObject; files: MetadataToWrite[] }[] = [
    { type: 'PAGES', files: getMetadata(files, 'PAGES', options, true) },
    { type: 'SERVERS', files: getMetadata(files, 'SERVERS', options, true) },
    { type: 'ACTIONS', files: getMetadata(files, 'ACTIONS', options, false) },
    { type: 'LINKS', files: getMetadata(files, 'LINKS', options, false) },
  ]

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
          // Even with warning, we should wite the file
          // allOk = false
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
                // Even with warning, we should wite the file
                // allOk = false
              }
            })
          }
        }
      })
    })

  if (allOk) {
    const result = write(options.generated_file_path, [
      `/** 
 * This file was generated by 'vite-plugin-kit-routes'
 * 
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */${options?.path_base ? `\nimport { base } from '$app/paths'` : ''}
`,
      // consts
      options?.format === 'variables'
        ? // Format variables
          objTypes
            .map(c => {
              return `/**\n * ${c.type}\n */
${c.files
  .map(key => {
    if (key.strParams) {
      return (
        `export const ${c.type.slice(0, -1)}_${key.keyToUse} = (${key.strParams}) => {` +
        `${format({ bottom: 0, top: 1, left: 2 }, key.strDefault)}
  return ${key.strReturn} 
}`
      )
    } else {
      return `export const ${c.type.slice(0, -1)}_${key.keyToUse} = ${key.strReturn}`
    }
  })
  .join('\n')}`
            })
            .join(`\n\n`)
        : // Format Others
          objTypes
            .map(c => {
              return (
                `/**\n * ${c.type}\n */
${options?.format?.includes('route') ? `` : `export `}` +
                `const ${c.type} = {
  ${c.files
    .map(key => {
      if (key.strParams) {
        return (
          `"${key.keyToUse}": (${key.strParams}) => {` +
          `${format({ bottom: 0, top: 1, left: 4 }, key.strDefault)}
    return ${key.strReturn}
  }`
        )
      } else {
        return `"${key.keyToUse}": ${key.strReturn}`
      }
    })
    .join(',\n  ')}
}`
              )
            })
            .join(`\n\n`),

      format({ top: 1, left: 0 }, appendSp),

      // add appendSp
      ...(options?.format?.includes('route') ? [format({ left: 0 }, routeFn)] : []),

      // types
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
*    // here, key of object will be typed!
*  }
* })
* \`\`\`
*/
export type KIT_ROUTES = { 
${objTypes
  .map(c => {
    return `  ${c.type}${arrayToRecord(
      c.files.map(d => {
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
      }),
    )}`
  })
  .join('\n')}
  Params${arrayToRecord([
    ...new Set(
      objTypes.flatMap(c => c.files.flatMap(d => d.paramsFromPath.map(e => `${e.name}: never`))),
    ),
  ])}
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
          theEnd(result, objTypes, options)
        })
      }
    } else {
      theEnd(result, objTypes, options)
    }
    return true
  }

  return false
}

function theEnd(
  result: boolean,
  objTypes: { type: KindOfObject; files: MetadataToWrite[] }[],
  o: Options,
) {
  const options = getDefaultOption(o)
  if (result) {
    if (shouldLog('update', options)) {
      log.success(`${yellow(options.generated_file_path)} updated`)
    }

    if (shouldLog('stats', options)) {
      const stats = []
      let nbRoutes = objTypes.flatMap(c => c.files).length
      stats.push(
        `Routes: ${yellow('' + nbRoutes)} ` +
          `${italic(
            `(${objTypes.map(c => `${c.type}: ${yellow('' + c.files.length)}`).join(', ')})`,
          )}`,
      )
      let confgPoints = stry0(Object.entries(options ?? {}))!.length

      stats.push(`Points: ${yellow('' + confgPoints)}`)
      const score = (confgPoints / nbRoutes).toFixed(2)
      stats.push(`Score: ${yellow(score)}`)
      stats.push(`Format: "${yellow('' + options?.format)}"`)

      log.success(`${green('Stats:')} ${stats.join(' | ')}`)
      log.info(
        `${gray(' Share on TwiX:')} ${cyan(
          `https://twitter.com/intent/tweet?text=` +
            `${encodeURI(
              `🚀 Check out my "kit-routes" stats 🚀\n\n` +
                `- Routes: ${nbRoutes} (${objTypes.map(c => c.files.length).join(', ')})\n` +
                `- Points: ${confgPoints}\n` +
                `- Score: ${score}\n` +
                `- Format: ${options?.format}\n\n` +
                `👀 @jycouet`,
            )}`,
        )}`,
      )
    }

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

import { parse } from '@babel/parser'
import { green, Log, red, yellow } from '@kitql/helpers'
import { readdirSync } from 'fs'
import { spawn } from 'node:child_process'
import * as recast from 'recast'
import type { Plugin } from 'vite'
import watch_and_run from 'vite-plugin-watch-and-run'

import { read, write } from './fs.js'

const { visit } = recast.types

export type Options<
  T extends {
    PAGES: Record<string, string>
    SERVERS: Record<string, string>
    ACTIONS: Record<string, string>
    Params: Record<string, string>
  } = {
    PAGES: Record<string, string>
    SERVERS: Record<string, string>
    ACTIONS: Record<string, string>
    Params: Record<string, string>
  },
> = {
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
   * default is: `string | number`
   */
  default_type?: string

  /**
   * when `without` _(default)_, paths doesn't get a last argument to set extra search params
   *
   * when `with`, each paths get an extra arg for open search param
   *
   * Can be tuned at individual path level
   */
  extra_search_params?: 'with' | 'without'

  extend?: {
    PAGES?: Partial<{ [K in keyof T['PAGES']]: CustomPath<Extract<T['PAGES'][K], string>> }>
    SERVERS?: Partial<{ [K in keyof T['SERVERS']]: CustomPath<Extract<T['SERVERS'][K], string>> }>
    ACTIONS?: Partial<{ [K in keyof T['ACTIONS']]: CustomPath<Extract<T['ACTIONS'][K], string>> }>
  }

  override_params?: Partial<{ [K in keyof T['Params']]: OverrideParam }>

  // TODO STORAGE?
  // storage?: {
  //   /**
  //    * @default 'kitRoutes' but you can change it to avoid conflict with other localStorage?
  //    */
  //   key?: string

  //   params?: Partial<{ [K in keyof T['Storage_Params']]: StorageParam }>
  // }
}

export type CustomPath<Params extends string | never = string> = {
  explicit_search_params?: Record<string, ExplicitSearchParam>
  params?: Partial<Record<Params, ExtendParam>>
  extra_search_params?: 'default' | 'with' | 'without'
}

export type OverrideParam = {
  type: string
  // default?: string //TODO one day?
}

// export type StorageParam = {
//   type: string
//   default?: string
// }

export type ExtendParam = {
  type?: string
  default?: string
}

export type ExplicitSearchParam = ExtendParam & {
  required?: boolean
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
  type: 'PAGES' | 'SERVERS' | 'ACTIONS',
  options?: Options,
  withAppendSp?: boolean,
) => {
  const lookFor =
    type === 'PAGES' ? '+page.svelte' : type === 'SERVERS' ? '+server.ts' : '+page.server.ts'
  const useWithAppendSp = withAppendSp && options?.extra_search_params === 'with'

  let files = readdirSync(routes_path(), { recursive: true }) as string[]
  // For windows
  files = files.map(c => c.replaceAll('\\', '/'))
  return (
    files
      .filter(file => file.endsWith(lookFor))
      .map(file => `/` + file.replace(`/${lookFor}`, '').replace(lookFor, ''))
      // Keep the sorting at this level, it will make more sense
      .sort()
      .map(original => fileToMetadata(original, type, options, useWithAppendSp))
  )
}

type Param = { name: string; optional: boolean; matcher?: string; type?: string; default?: string }

export const fileToMetadata = (
  original: string,
  type: 'PAGES' | 'SERVERS' | 'ACTIONS',
  options: Options | undefined,
  useWithAppendSp: boolean | undefined,
) => {
  let toRet = original.replace(/\([^)]*\)/g, '').replace(/\/+/g, '/')

  const keyToUse = formatKey(original, options)

  // custom conf
  const viteCustomPathConfig = options?.extend?.[type]
  let customConf: CustomPath = {
    extra_search_params: 'default',
  }
  if (viteCustomPathConfig && viteCustomPathConfig[keyToUse]) {
    // @ts-expect-error
    customConf = viteCustomPathConfig[keyToUse]
  }

  const paramsFromPath = extractParamsFromPath(original)

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

  paramsFromPath.forEach(c => {
    const sMatcher = `${c.matcher ? `=${c.matcher}` : ''}`

    // First optionnals
    toRet = toRet.replaceAll(
      `/[[${c.name + sMatcher}]]`,
      `\${params?.${c.name} ? \`/\${params?.${c.name}}\`: ''}`,
    )
    // We need to manage the 2 cases (with "/" prefix and without)
    toRet = toRet.replaceAll(
      `[[${c.name + sMatcher}]]`,
      `\${params?.${c.name} ? \`\${params?.${c.name}}\`: ''}`,
    )

    // Second params
    toRet = toRet.replaceAll(`/[${c.name + sMatcher}]`, `/\${params.${c.name}}`)
    // We need to manage the 2 cases (with "/" prefix and without)
    toRet = toRet.replaceAll(`[${c.name + sMatcher}]`, `\${params.${c.name}}`)
  })

  const params = []

  let actionsFormat = ''
  if (type === 'SERVERS') {
    const methods = getMethodsOfServerFiles(original)
    if (methods.length > 0) {
      params.push(`method: ${methods.map(c => `'${c}'`).join(' | ')}`)
    }
  } else if (type === 'ACTIONS') {
    const actions = getActionsOfServerPages(original)

    if (actions.length === 0) {
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
      paramsFromPath.push({ name: sp[0], optional: !sp[1].required, type: sp[1].type })
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

  // TODO STORAGE?
  // const oParams = Object.entries(options?.storage?.params ?? [])
  let paramsDefaults = paramsFromPath
    .filter(c => c.default !== undefined)
    .map(c => {
      // const oParam = oParams.filter(p => p[0] === c.name)
      let additionalByStore = ''
      // if (oParam.length > 0) {
      //   for (const [key, value] of Object.entries(oParam)) {
      //     additionalByStore += `/* waiting for ✨ Runes ✨ to have a perfect api! get(kitRoutes)?.${value[0]} ?? */ `
      //   }
      // }

      return `params.${c.name} = params.${c.name} ?? ${additionalByStore}'${c.default}'; `
    })

  const prop =
    `"${keyToUse}": (${params.join(', ')}) => ` +
    ` {${paramsDefaults.length > 0 ? `\n    ${paramsDefaults.join('\n    ')}` : ''}
    return ensurePrefix(\`${toRet}${actionsFormat}${fullSP}\`)
  }`

  return { keyToUse, prop, paramsFromPath }
}

export function extractParamsFromPath(path: string): Param[] {
  const paramPattern = /\[+([^\]]+)]+/g
  const params: Param[] = []

  let match
  while ((match = paramPattern.exec(path)) !== null) {
    // Check if it's surrounded by double brackets indicating an optional parameter
    const isOptional = match[0].startsWith('[[')
    const matcher = match[1].split('=')
    if (matcher.length === 2) {
      params.push({
        name: matcher[0],
        optional: isOptional,
        matcher: matcher[1],
      })
    } else {
      params.push({
        name: match[1],
        optional: isOptional,
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

      return `${c.name}${c.optional ? '?' : ''}: ${
        c.type ?? override_param ?? options?.default_type ?? 'string | number'
      }`
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
      return false
    },
  })

  return exportedNames
}

// TODO: Actions when no action? only load?
// TODO: Actions graphQL GET / blabla?
// TODO: Remove store for now! Demo with $page.param => Ask for opinions

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
            // FIX ME
            // if(properties){
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
  const objTypes = [
    { type: 'PAGES', files: getFileKeys('PAGES', options, true) },
    { type: 'SERVERS', files: getFileKeys('SERVERS', options, true) },
    { type: 'ACTIONS', files: getFileKeys('ACTIONS', options, false) },
  ] as const

  // Validate options
  let allOk = true
  objTypes.forEach(o => {
    Object.entries(options?.extend?.[o.type] ?? {}).forEach(e => {
      const [key, cPath] = e
      const found = o.files.find(c => c.keyToUse === key)
      if (!found) {
        log.error(`Can't extend "${green(`${o.type}.`)}${red(key)}" as this path doesn't exist!`)
        allOk = false
      } else {
        if (cPath) {
          Object.entries(cPath.params ?? {}).forEach(p => {
            const [pKey] = p
            const paramsFromPathFound = found.paramsFromPath.find(c => c.name === pKey)
            if (!paramsFromPathFound) {
              log.error(
                `Can't extend "${green(`${o.type}.${key}.params.`)}${red(
                  pKey,
                )}" as this param doesn't exist!`,
              )
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
      objTypes
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

const ensurePrefix = (str: string) => {
  if (str.startsWith('/')) {
    return str
  }
  return \`/\${str}\`
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
*  extend: {
*    PAGES: {
*      // here, "paths" it will be typed!
*    }
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
          d.paramsFromPath.length === 0
            ? 'never'
            : d.paramsFromPath
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
      //       // TODO STORAGE?
      //       `import { browser } from '$app/environment'
      // import { writable } from 'svelte/store'

      // const _kitRoutes = <T>(key: string, initValues?: T) => {
      //   const store = writable<T>(initValues, set => {
      //     if (browser) {
      //       if(initValues){
      //         const v = localStorage.getItem(key)
      //         if (v) {
      //           try {
      //             const json = JSON.parse(v)
      //             set(json)
      //           } catch (error) {
      //             set(initValues)
      //           }
      //         } else {
      //           set(initValues)
      //         }
      //       } else {
      //         set({} as any)
      //       }

      //       const handleStorage = (event: StorageEvent) => {
      //         if (event.key === key) set(event.newValue ? JSON.parse(event.newValue) : null)
      //       }
      //       window.addEventListener('storage', handleStorage)
      //       return () => window.removeEventListener('storage', handleStorage)
      //     } else {
      //       if(initValues) {
      //         set(initValues)
      //       } else {
      //         set({} as any)
      //       }
      //     }
      //   })

      //   return {
      //     subscribe: store.subscribe,
      //     update: (u: T) => {
      //       if (browser) {
      //         localStorage.setItem(key, JSON.stringify(u))
      //       }
      //       store.update(() => u)
      //     },
      //   }
      // }

      // export type StorageParams = ${
      //         options?.storage?.params
      //           ? Object.entries(options?.storage?.params)
      //               .map(c => {
      //                 return `{ ${c[0]}: ${c[1]?.type} }`
      //               })
      //               .join(', ')
      //           : '{ }'
      //       }
      // /**
      //  *
      //  * Example of usage:
      //  * \`\`\`ts
      //  *  import { afterNavigate } from '$app/navigation'
      //  *  import { kitRoutes } from '$lib/ROUTES.js'
      //  *
      //  *  afterNavigate(() => {
      //  *	  kitRoutes.update({ lang: $page.params.lang })
      //  *  })
      //  * \`\`\`
      //  *
      //  */
      // export let kitRoutes = _kitRoutes<StorageParams>('${options?.storage?.key ?? 'kitRoutes'}')

      // `,
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
export function kitRoutes<
  T extends {
    PAGES: Record<string, string>
    SERVERS: Record<string, string>
    ACTIONS: Record<string, string>
    Params: Record<string, string>
  } = {
    PAGES: Record<string, string>
    SERVERS: Record<string, string>
    ACTIONS: Record<string, string>
    Params: Record<string, string>
  },
>(options?: Options<T>): Plugin[] {
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

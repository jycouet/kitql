/* eslint-disable */
/** 
 * This file was generated by 'vite-plugin-kit-routes'
 * 
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

/**
 * PAGES
 */
const PAGES = {
  "/": `/`,
  "/subGroup": `/subGroup`,
  "/subGroup/user": `/subGroup/user`,
  "/subGroup2": (params: { first: (string | number) }) => {
    return `/subGroup2${appendSp({ first: params.first })}`
  },
  "/contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract${appendSp(sp)}`
  },
  "/contract/[id]": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract/${params.id}`
  },
  "/gp/one": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/gp/one`
  },
  "/gp/two": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/gp/two`
  },
  "/main": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/main`
  },
  "/match/[id=ab]": (params: { id: (Parameters<typeof import('../params/ab.ts').match>[0]), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/match/${params.id}`
  },
  "/match/[id=int]": (params: { id: (number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/match/${params.id}`
  },
  "/site": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site${appendSp({ ...sp, limit: params?.limit })}`
  },
  "/site/[id]": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
    params = params ?? {}
    params.lang = params.lang ?? "fr"; 
    params.id = params.id ?? "Vienna"; 
    return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}${appendSp({ limit: params?.limit, demo: params?.demo })}`
  },
  "/site_contract/[siteId]-[contractId]": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}${appendSp({ limit: params?.limit })}`
  },
  "/a/[...rest]/z": (params: { rest: (string | number)[] }) => {
    return `/a/${params.rest?.join('/')}/z`
  },
  "/lay/normal": `/lay/normal`,
  "/lay/root-layout": `/lay/root-layout`,
  "/lay/skip": `/lay/skip`,
  "/sp": `/sp`
}

/**
 * SERVERS
 */
const SERVERS = {
  "GET /contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract`
  },
  "POST /contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract`
  },
  "GET /site": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site`
  },
  "GET /api/graphql": `/api/graphql`,
  "POST /api/graphql": `/api/graphql`,
  "GET /data/errors/[locale].json": (params: { locale: (string | number) }) => {
    return `/data/errors/${params.locale}.json`
  }
}

/**
 * ACTIONS
 */
const ACTIONS = {
  "default /contract/[id]": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract/${params.id}${appendSp({ limit: params?.limit })}`
  },
  "create /site": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site?/create`
  },
  "update /site/[id]": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}?/update`
  },
  "delete /site/[id]": (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}?/delete`
  },
  "noSatisfies /site_contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site_contract?/noSatisfies`
  },
  "send /site_contract/[siteId]-[contractId]": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
    params.extra = params.extra ?? "A"; 
    return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}?/send${appendSp({ extra: params?.extra }, '&')}`
  }
}

/**
 * LINKS
 */
const LINKS = {
  "twitter": `https://twitter.com/jycouet`,
  "twitter_post": (params: { name: (string | number), id: (string | number) }) => {
    return `https://twitter.com/${params.name}/status/${params.id}`
  },
  "gravatar": (params: { str: (string | number), s?: (number), d?: ("retro" | "identicon") }) => {
    params.s = params.s ?? 75; 
    params.d = params.d ?? "identicon"; 
    return `https://www.gravatar.com/avatar/${params.str}${appendSp({ s: params?.s, d: params?.d })}`
  }
}

/**
 * Append search params to a string
 */
const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''
  const mapping = Object.entries(sp)
    .filter(c => c[1] !== undefined)
    .map(c => [c[0], String(c[1])])

  const formated = new URLSearchParams(mapping).toString()
  if (formated) {
    return `${prefix}${formated}`
  }
  return ''
}

/**
 * get the current search params
 * 
 * Could be use like this:
 * ```
 * route("/cities", { page: 2 }, { ...currentSP() })
 * ```
 */ 
export const currentSp = () => {
  const params = new URLSearchParams(window.location.search)
  const record: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    record[key] = value
  }
  return record
}

// route function helpers
type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
type AllTypes = typeof AllObjs

/**
 * To be used like this: 
 * ```ts
 * import { route } from '$lib/ROUTES'
 * 
 * route('site_id', { id: 1 })
 * ```
 */
export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
  if (AllObjs[key] as any instanceof Function) {
    const element = (AllObjs as any)[key] as (...args: any[]) => string
    return element(...params)
  } else {
    return AllObjs[key] as string
  }
}

/**
* Add this type as a generic of the vite plugin `kitRoutes<KIT_ROUTES>`.
* 
* Full example:
* ```ts
* import type { KIT_ROUTES } from '$lib/ROUTES'
* import { kitRoutes } from 'vite-plugin-kit-routes'
* 
* kitRoutes<KIT_ROUTES>({
*  PAGES: {
*    // here, key of object will be typed!
*  }
* })
* ```
*/
export type KIT_ROUTES = { 
  PAGES: { '/': never, '/subGroup': never, '/subGroup/user': never, '/subGroup2': never, '/contract': 'lang', '/contract/[id]': 'id' | 'lang', '/gp/one': 'lang', '/gp/two': 'lang', '/main': 'lang', '/match/[id=ab]': 'id' | 'lang', '/match/[id=int]': 'id' | 'lang', '/site': 'lang', '/site/[id]': 'lang' | 'id', '/site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang', '/a/[...rest]/z': 'rest', '/lay/normal': never, '/lay/root-layout': never, '/lay/skip': never, '/sp': never }
  SERVERS: { 'GET /contract': 'lang', 'POST /contract': 'lang', 'GET /site': 'lang', 'GET /api/graphql': never, 'POST /api/graphql': never, 'GET /data/errors/[locale].json': 'locale' }
  ACTIONS: { 'default /contract/[id]': 'id' | 'lang', 'create /site': 'lang', 'update /site/[id]': 'id' | 'lang', 'delete /site/[id]': 'id' | 'lang', 'noSatisfies /site_contract': 'lang', 'send /site_contract/[siteId]-[contractId]': 'siteId' | 'contractId' | 'lang' }
  LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
  Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, locale: never, extra: never, name: never, str: never, s: never, d: never }
}

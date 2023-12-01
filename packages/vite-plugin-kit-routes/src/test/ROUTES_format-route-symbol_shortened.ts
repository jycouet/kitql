/** 
 * This file was generated by 'vite-plugin-kit-routes'
 * 
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

/**
 * PAGES
 */
const PAGES = {
  "_ROOT": `/`,
  "subGroup": `/subGroup`,
  "subGroup2": (first: (string | number), params?: {  }) => {
    return `/subGroup2${appendSp({ first })}`
  },
  "contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract${appendSp(sp)}`
  },
  "contract_id": (id: (string | number), params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract/${id}`
  },
  "gp_one": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/gp/one`
  },
  "gp_two": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/gp/two`
  },
  "main": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/main`
  },
  "match_id_int": (id: (number), params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/match/${id}`
  },
  "site": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site${appendSp({ ...sp, limit: params?.limit })}`
  },
  "site_id": (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
    params = params ?? {}
    params.lang = params.lang ?? "fr"; 
    params.id = params.id ?? "Vienna"; 
    return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}${appendSp({ limit: params?.limit, demo: params?.demo })}`
  },
  "site_contract_siteId_contractId": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}${appendSp({ limit: params?.limit })}`
  },
  "a_rest_z": (rest: (string | number)[], params?: {  }) => {
    return `/a/${rest?.join('/')}/z`
  },
  "lay_normal": `/lay/normal`,
  "lay_root_layout": `/lay/root-layout`,
  "lay_skip": `/lay/skip`
}

/**
 * SERVERS
 */
const SERVERS = {
  "GET contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract`
  },
  "POST contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract`
  },
  "GET site": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site`
  },
  "GET api_graphql": `/api/graphql`,
  "POST api_graphql": `/api/graphql`
}

/**
 * ACTIONS
 */
const ACTIONS = {
  "default contract_id": (id: (string | number), params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/contract/${id}${appendSp({ limit: params?.limit })}`
  },
  "create site": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site?/create`
  },
  "update site_id": (id: (string | number), params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site/${id}?/update`
  },
  "delete site_id": (id: (string | number), params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site/${id}?/delete`
  },
  "noSatisfies site_contract": (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
    return `${params?.lang ? `/${params?.lang}`: ''}/site_contract?/noSatisfies`
  },
  "send site_contract_siteId_contractId": (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
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
  "gravatar": (str: (string | number), params?: { s?: (number), d?: ("retro" | "identicon") }) => {
    params = params ?? {}
    params.s = params.s ?? 75; 
    params.d = params.d ?? "identicon"; 
    return `https://www.gravatar.com/avatar/${str}${appendSp({ s: params?.s, d: params?.d })}`
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
  PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'lang' | 'id', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_int': 'lang' | 'id', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
  SERVERS: { 'GET contract': 'lang', 'POST contract': 'lang', 'GET site': 'lang', 'GET api_graphql': never, 'POST api_graphql': never }
  ACTIONS: { 'default contract_id': 'lang' | 'id', 'create site': 'lang', 'update site_id': 'lang' | 'id', 'delete site_id': 'lang' | 'id', 'noSatisfies site_contract': 'lang', 'send site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
  LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
  Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
}

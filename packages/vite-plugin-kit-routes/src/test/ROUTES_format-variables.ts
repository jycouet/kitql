/* eslint-disable */
/**
 * This file was generated by 'vite-plugin-kit-routes'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

/**
 * PAGES
 */
export const PAGE__ROOT = `/`
export const PAGE_subGroup = `/subGroup`
export const PAGE_subGroup_user = `/subGroup/user`
export const PAGE_subGroup2 = (params: { first: (string | number) }) => {
  return `/subGroup2${appendSp({ first: params.first })}`
}
export const PAGE_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }, sp?: Record<string, string | number>) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/contract${appendSp(sp)}`
}
export const PAGE_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/contract/${params.id}`
}
export const PAGE_gp_one = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/gp/one`
}
export const PAGE_gp_two = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/gp/two`
}
export const PAGE_main = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/main`
}
export const PAGE_match_id_ab = (params: { id: (Parameters<typeof import('../params/ab.ts').match>[0]), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/match/${params.id}`
}
export const PAGE_match_id_int = (params: { id: (number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/match/${params.id}`
}
export const PAGE_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site${appendSp({ ...sp, limit: params?.limit })}`
}
export const PAGE_site_id = (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
  params = params ?? {}
  params.lang = params.lang ?? "fr"; 
  params.id = params.id ?? "Vienna"; 
  return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}${appendSp({ limit: params.limit, demo: params.demo })}`
}
export const PAGE_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}${appendSp({ limit: params.limit })}`
}
export const PAGE_a_rest_z = (params: { rest: (string | number)[] }) => {
  return `/a/${params.rest?.join('/')}/z`
}
export const PAGE_lay_normal = `/lay/normal`
export const PAGE_lay_root_layout = `/lay/root-layout`
export const PAGE_lay_skip = `/lay/skip`
export const PAGE_sp = `/sp`
export const PAGE_spArray = (params: { ids: (number[]) }) => {
  return `/spArray${appendSp({ ids: params.ids })}`
}
export const PAGE_spArrayComma = (params: { ids: (number[]) }) => {
  return `/spArrayComma${appendSp({ ids: String(params.ids) })}`
}

/**
 * SERVERS
 */
export const SERVER_GET_server_func_get = `/server_func_get`
export const SERVER_GET_server_func_get_and = `/server_func_get_and_`
export const SERVER_POST_server_func_post = `/server_func_post`
export const SERVER_GET_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/contract`
}
export const SERVER_POST_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/contract`
}
export const SERVER_GET_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site`
}
export const SERVER_GET_api_graphql = `/api/graphql`
export const SERVER_POST_api_graphql = `/api/graphql`
export const SERVER_GET_data_errors_locale_json = (params: { locale: (string | number) }) => {
  return `/data/errors/${params.locale}.json`
}

/**
 * ACTIONS
 */
export const ACTION_default_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/contract/${params.id}${appendSp({ limit: params.limit })}`
}
export const ACTION_create_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site?/create`
}
export const ACTION_update_site_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}?/update`
}
export const ACTION_delete_site_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}?/delete`
}
export const ACTION_noSatisfies_site_contract = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site_contract?/noSatisfies`
}
export const ACTION_send_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), extra?: ('A' | 'B') }) => {
  params.extra = params.extra ?? "A"; 
  return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}?/send${appendSp({ extra: params.extra }, '&')}`
}

/**
 * LINKS
 */
export const LINK_twitter = `https://twitter.com/jycouet`
export const LINK_twitter_post = (params: { name: (string | number), id: (string | number) }) => {
  return `https://twitter.com/${params.name}/status/${params.id}`
}
export const LINK_gravatar = (params: { str: (string | number), s?: (number), d?: ("retro" | "identicon") }) => {
  params.s = params.s ?? 75; 
  params.d = params.d ?? "identicon"; 
  return `https://www.gravatar.com/avatar/${params.str}${appendSp({ s: params.s, d: params.d })}`
}

type ParamValue = string | number | undefined

/**
 * Append search params to a string
 */
export const appendSp = (sp?: Record<string, ParamValue | ParamValue[]>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''

  const params = new URLSearchParams()
  const append = (n: string, v: ParamValue) => {
    if (v !== undefined) {
      params.append(n, String(v))
    }
  }

  for (const [name, val] of Object.entries(sp)) {
    if (Array.isArray(val)) {
      for (const v of val) {
        append(name, v)
      }
    } else {
      append(name, val)
    }
  }

  const formatted = params.toString()
  if (formatted) {
    return `${prefix}${formatted}`
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

/**
* Add this type as a generic of the vite plugin `kitRoutes<KIT_ROUTES>`.
*
* Full example:
* ```ts
* import type { KIT_ROUTES } from '$_lib/ROUTES'
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
  PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup_user': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'id' | 'lang', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_ab': 'id' | 'lang', 'match_id_int': 'id' | 'lang', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never, 'sp': never, 'spArray': never, 'spArrayComma': never }
  SERVERS: { 'GET_server_func_get': never, 'GET_server_func_get_and': never, 'POST_server_func_post': never, 'GET_contract': 'lang', 'POST_contract': 'lang', 'GET_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never, 'GET_data_errors_locale_json': 'locale' }
  ACTIONS: { 'default_contract_id': 'id' | 'lang', 'create_site': 'lang', 'update_site_id': 'id' | 'lang', 'delete_site_id': 'id' | 'lang', 'noSatisfies_site_contract': 'lang', 'send_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
  LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
  Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, ids: never, locale: never, extra: never, name: never, str: never, s: never, d: never }
}

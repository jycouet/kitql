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
export const PAGE_match_id_int = (params: { id: (number), lang?: ('fr' | 'en' | 'hu' | 'at' | string) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/match/${params.id}` 
}
export const PAGE_site = (params?: { lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }, sp?: Record<string, string | number>) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site${appendSp({ limit: params?.limit, ...sp })}` 
}
export const PAGE_site_id = (params?: { lang?: ('fr' | 'hu' | undefined), id?: (string), limit?: (number), demo?: (string) }) => {
  params = params ?? {}
  params.lang = params.lang ?? "fr"; 
  params.id = params.id ?? "Vienna"; 
  return `${params?.lang ? `/${params?.lang}`: ''}/site/${params.id}${appendSp({ limit: params?.limit, demo: params?.demo })}` 
}
export const PAGE_site_contract_siteId_contractId = (params: { siteId: (string | number), contractId: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}${appendSp({ limit: params?.limit })}` 
}
export const PAGE_a_rest_z = (params: { rest: (string | number)[] }) => {
  return `/a/${params.rest?.join('/')}/z` 
}
export const PAGE_lay_normal = `/lay/normal`
export const PAGE_lay_root_layout = `/lay/root-layout`
export const PAGE_lay_skip = `/lay/skip`

/**
 * SERVERS
 */
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

/**
 * ACTIONS
 */
export const ACTION_default_contract_id = (params: { id: (string | number), lang?: ('fr' | 'en' | 'hu' | 'at' | string), limit?: (number) }) => {
  return `${params?.lang ? `/${params?.lang}`: ''}/contract/${params.id}${appendSp({ limit: params?.limit })}` 
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
  return `${params?.lang ? `/${params?.lang}`: ''}/site_contract/${params.siteId}-${params.contractId}?/send${appendSp({ extra: params?.extra }, '&')}` 
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
  return `https://www.gravatar.com/avatar/${params.str}${appendSp({ s: params?.s, d: params?.d })}` 
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
  PAGES: { '_ROOT': never, 'subGroup': never, 'subGroup2': never, 'contract': 'lang', 'contract_id': 'id' | 'lang', 'gp_one': 'lang', 'gp_two': 'lang', 'main': 'lang', 'match_id_int': 'id' | 'lang', 'site': 'lang', 'site_id': 'lang' | 'id', 'site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang', 'a_rest_z': 'rest', 'lay_normal': never, 'lay_root_layout': never, 'lay_skip': never }
  SERVERS: { 'GET_contract': 'lang', 'POST_contract': 'lang', 'GET_site': 'lang', 'GET_api_graphql': never, 'POST_api_graphql': never }
  ACTIONS: { 'default_contract_id': 'id' | 'lang', 'create_site': 'lang', 'update_site_id': 'id' | 'lang', 'delete_site_id': 'id' | 'lang', 'noSatisfies_site_contract': 'lang', 'send_site_contract_siteId_contractId': 'siteId' | 'contractId' | 'lang' }
  LINKS: { 'twitter': never, 'twitter_post': 'name' | 'id', 'gravatar': 'str' }
  Params: { first: never, lang: never, id: never, limit: never, demo: never, siteId: never, contractId: never, rest: never, extra: never, name: never, str: never, s: never, d: never }
}

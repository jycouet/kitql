/**
 * This file was generated by 'vite-plugin-kit-routes'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

export const PAGES = {
  _ROOT: `/`,
  subGroup: `/subGroup`,
  subGroup2: (params: { first: string | number }) => {
    return `/subGroup2${appendSp({ first: params?.first })}`
  },
  lang_contract: (params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract`
  },
  lang_contract_id: (params: {
    lang?: 'fr' | 'en' | 'hu' | 'at' | string
    id: string | number
  }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract/${params.id}`
  },
  lang_gp_one: (params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/gp/one`
  },
  lang_gp_two: (params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/gp/two`
  },
  lang_main: (params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/main`
  },
  lang_match_id_int: (params: {
    lang?: 'fr' | 'en' | 'hu' | 'at' | string
    id: string | number
  }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/match/${params.id}`
  },
  lang_site: (
    params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string; limit?: number },
    sp?: Record<string, string | number>,
  ) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site${appendSp({
      limit: params?.limit,
      ...sp,
    })}`
  },
  lang_site_id: (params?: {
    lang?: 'fr' | 'hu' | undefined
    id?: string
    limit?: number
    demo?: string
  }) => {
    params = params ?? {}
    params.lang = params.lang ?? 'fr'
    params.id = params.id ?? 'Vienna'
    return `${params?.lang ? `/${params?.lang}` : ''}/site/${params.id}${appendSp({
      limit: params?.limit,
      demo: params?.demo,
    })}`
  },
  lang_site_contract_siteId_contractId: (params: {
    lang?: 'fr' | 'en' | 'hu' | 'at' | string
    siteId: string | number
    contractId: string | number
    limit?: number
  }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site_contract/${params.siteId}-${
      params.contractId
    }${appendSp({ limit: params?.limit })}`
  },
  a_rest_z: (params: { rest: (string | number)[] }) => {
    return `/a/${params.rest?.join('/')}/z`
  },
  lay_normal: `/lay/normal`,
  lay_root_layout: `/lay/root-layout`,
  lay_skip: `/lay/skip`,
}

export const SERVERS = {
  lang_contract: (
    method: 'GET' | 'POST',
    params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string },
  ) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract`
  },
  lang_site: (method: 'GET', params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site`
  },
  api_graphql: (method: 'GET' | 'POST') => {
    return `/api/graphql`
  },
}

export const ACTIONS = {
  lang_contract_id: (
    action: 'default',
    params: { lang?: 'fr' | 'en' | 'hu' | 'at' | string; id: string | number; limit?: number },
  ) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract/${params.id}${appendSp({
      limit: params?.limit,
    })}`
  },
  lang_site: (
    action: 'action1' | 'action2',
    params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string },
  ) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site?/${action}`
  },
  lang_site_contract: (
    action: 'noSatisfies',
    params?: { lang?: 'fr' | 'en' | 'hu' | 'at' | string },
  ) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site_contract?/${action}`
  },
  lang_site_contract_siteId_contractId: (
    action: 'sendSomething',
    params: {
      lang?: 'fr' | 'en' | 'hu' | 'at' | string
      siteId: string | number
      contractId: string | number
      extra?: 'A' | 'B'
    },
  ) => {
    params.extra = params.extra ?? 'A'
    return `${params?.lang ? `/${params?.lang}` : ''}/site_contract/${params.siteId}-${
      params.contractId
    }?/${action}${appendSp({ extra: params?.extra }, '&')}`
  },
}

export const LINKS = {
  twitter: `https:/twitter.com/jycouet`,
  twitter_post: (params: { name: string | number; id: string | number }) => {
    return `https:/twitter.com/${params.name}/status/${params.id}`
  },
  gravatar: (params: { str: string; s?: number; d?: 'retro' | 'identicon' }) => {
    params.s = params.s ?? 75
    params.d = params.d ?? 'identicon'
    return `https:/www.gravatar.com/avatar/${params.str}${appendSp({ s: params?.s, d: params?.d })}`
  },
}
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
  PAGES: {
    _ROOT: never
    subGroup: never
    subGroup2: never
    lang_contract: 'lang'
    lang_contract_id: 'lang' | 'id'
    lang_gp_one: 'lang'
    lang_gp_two: 'lang'
    lang_main: 'lang'
    lang_match_id_int: 'lang' | 'id'
    lang_site: 'lang'
    lang_site_id: 'lang' | 'id'
    lang_site_contract_siteId_contractId: 'lang' | 'siteId' | 'contractId'
    a_rest_z: 'rest'
    lay_normal: never
    lay_root_layout: never
    lay_skip: never
  }
  SERVERS: { lang_contract: 'lang'; lang_site: 'lang'; api_graphql: never }
  ACTIONS: {
    lang_contract_id: 'lang' | 'id'
    lang_site: 'lang'
    lang_site_contract: 'lang'
    lang_site_contract_siteId_contractId: 'lang' | 'siteId' | 'contractId'
  }
  LINKS: { twitter: never; twitter_post: 'name' | 'id'; gravatar: 'str' }
  Params: {
    first: never
    lang: never
    id: never
    limit: never
    demo: never
    siteId: never
    contractId: never
    rest: never
    extra: never
    name: never
    str: never
    s: never
    d: never
  }
}

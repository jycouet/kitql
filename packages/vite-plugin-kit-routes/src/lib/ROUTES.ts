/**
 * This file was generated by 'vite-plugin-kit-routes'
 *
 *      >> DO NOT EDIT THIS FILE MANUALLY <<
 */

export const PAGES = {
  lang: (params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : '/'}`
  },
  lang_contract: (params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract`
  },
  lang_contract_id: (params: { lang?: 'fr' | 'en' | 'hu' | 'at'; id: string | number }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract/${params.id}`
  },
  lang_gp_logged_one: (params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/gp/one`
  },
  lang_gp_public_two: (params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/gp/two`
  },
  lang_match_id_int: (params: { lang?: 'fr' | 'en' | 'hu' | 'at'; id: string | number }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/match/${params.id}`
  },
  lang_site: (params: { lang?: 'fr' | 'en' | 'hu' | 'at'; limit?: number } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site${appendSp({ limit: params.limit })}`
  },
  lang_site_id: (
    params: { lang?: 'fr' | 'hu' | undefined; id?: string; limit?: number; demo?: string } = {},
  ) => {
    params.lang = params.lang ?? 'fr'
    params.id = params.id ?? '7'
    return `${params?.lang ? `/${params?.lang}` : ''}/site/${params.id}${appendSp({
      limit: params.limit,
      demo: params.demo,
    })}`
  },
  lang_site_contract_siteId_contractId: (params: {
    lang?: 'fr' | 'en' | 'hu' | 'at'
    siteId: string | number
    contractId: string | number
    limit?: number
  }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site_contract/${params.siteId}-${
      params.contractId
    }${appendSp({ limit: params.limit })}`
  },
}

export const SERVERS = {
  lang_contract: (method: 'GET' | 'POST', params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract`
  },
  lang_site: (method: 'GET', params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site`
  },
  api_graphql: (method: 'GET' | 'POST') => {
    return `/api/graphql`
  },
}

export const ACTIONS = {
  lang_contract_id: (params: { lang?: 'fr' | 'en' | 'hu' | 'at'; id: string | number }) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/contract/${params.id}`
  },
  lang_site: (action: 'action1' | 'action2', params: { lang?: 'fr' | 'en' | 'hu' | 'at' } = {}) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site?/${action}`
  },
  lang_site_contract_siteId_contractId: (
    action: 'sendSomething',
    params: {
      lang?: 'fr' | 'en' | 'hu' | 'at'
      siteId: string | number
      contractId: string | number
      extra?: 'A' | 'B'
    },
  ) => {
    return `${params?.lang ? `/${params?.lang}` : ''}/site_contract/${params.siteId}-${
      params.contractId
    }?/${action}${appendSp({ extra: params.extra })}`
  },
}

const appendSp = (sp?: Record<string, string | number | undefined>) => {
  if (sp === undefined) return ''
  const mapping = Object.entries(sp)
    .filter(c => c[1] !== undefined)
    .map(c => [c[0], String(c[1])])

  const formated = new URLSearchParams(mapping).toString()
  if (formated) {
    return `?${formated}`
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
 *  extend: {
 *    PAGES: {
 *      // here, "paths" it will be typed!
 *    }
 *  }
 * })
 * ```
 */
export type KIT_ROUTES = {
  PAGES: {
    lang: 'lang'
    lang_contract: 'lang'
    lang_contract_id: 'lang' | 'id'
    lang_gp_logged_one: 'lang'
    lang_gp_public_two: 'lang'
    lang_match_id_int: 'lang' | 'id'
    lang_site: 'lang' | 'limit'
    lang_site_id: 'lang' | 'id' | 'limit' | 'demo'
    lang_site_contract_siteId_contractId: 'lang' | 'siteId' | 'contractId' | 'limit'
  }
  SERVERS: { lang_contract: 'lang'; lang_site: 'lang'; api_graphql: never }
  ACTIONS: {
    lang_contract_id: 'lang' | 'id'
    lang_site: 'lang'
    lang_site_contract_siteId_contractId: 'lang' | 'siteId' | 'contractId' | 'extra'
  }
  Params: {
    lang: never
    id: never
    limit: never
    demo: never
    siteId: never
    contractId: never
    extra: never
  }
}

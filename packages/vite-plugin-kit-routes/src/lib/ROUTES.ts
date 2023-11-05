export const PAGES = {
  _ROOT: () => {
    return `/`
  },
  contract: () => {
    return `/contract`
  },
  contract_id: (params: { id: string | number }) => {
    return `/contract/${params.id}`
  },
  gp_logged_one: () => {
    return `/gp/one`
  },
  gp_public_two: () => {
    return `/gp/two`
  },
  lang_lang: (params?: { lang?: string | number }) => {
    return `/lang/${params?.lang ?? ''}`
  },
  match_id_int: (params: { id: string | number }) => {
    return `/match/${params.id}`
  },
  site: () => {
    return `/site`
  },
  site_id: (params: { id: string | number }) => {
    return `/site/${params.id}`
  },
  site_contract_siteId_contractId: (params: {
    siteId: string | number
    contractId: string | number
  }) => {
    return `/site_contract/${params.siteId}-${params.contractId}`
  },
}

export const SERVERS = {
  contract: (method: 'GET' | 'POST') => {
    return `/contract`
  },
  site: (method: 'GET') => {
    return `/site`
  },
}

export const ACTIONS = {
  contract_id: (params: { id: string | number }) => {
    return `/contract/${params.id}`
  },
  site: (action: 'action1' | 'action2') => {
    return `/site?/${action}`
  },
  site_contract_siteId_contractId: (
    action: 'sendSomething',
    params: { siteId: string | number; contractId: string | number },
  ) => {
    return `/site_contract/${params.siteId}-${params.contractId}?/${action}`
  },
}

const appendSp = (sp?: Record<string, string | number>) => {
  if (sp === undefined) return ''
  return `?${new URLSearchParams((sp as Record<string, string>) || {}).toString()}`
}

export const PAGES = {
  _ROOT: (sp?: Record<string, string | number>) => {
    return `/${appendSp(sp)}`
  },
  contract: (sp?: Record<string, string | number>) => {
    return `/contract${appendSp(sp)}`
  },
  contract_id: (params: { id: string | number }, sp?: Record<string, string | number>) => {
    return `/contract/${params.id}${appendSp(sp)}`
  },
  gp_logged_one: (sp?: Record<string, string | number>) => {
    return `/gp/one${appendSp(sp)}`
  },
  gp_public_two: (sp?: Record<string, string | number>) => {
    return `/gp/two${appendSp(sp)}`
  },
  lang_lang: (params?: { lang?: string | number }, sp?: Record<string, string | number>) => {
    return `/lang/${params?.lang ?? ''}${appendSp(sp)}`
  },
  match_id_int: (params: { id: string | number }, sp?: Record<string, string | number>) => {
    return `/match/${params.id}${appendSp(sp)}`
  },
  site: (sp?: Record<string, string | number>) => {
    return `/site${appendSp(sp)}`
  },
  site_id: (params: { id: string | number }, sp?: Record<string, string | number>) => {
    return `/site/${params.id}${appendSp(sp)}`
  },
  site_contract_siteId_contractId: (
    params: { siteId: string | number; contractId: string | number },
    sp?: Record<string, string | number>,
  ) => {
    return `/site_contract/${params.siteId}-${params.contractId}${appendSp(sp)}`
  },
}

export const SERVERS = {
  contract: (method: 'GET' | 'POST', sp?: Record<string, string | number>) => {
    return `/contract${appendSp(sp)}`
  },
  site: (method: 'GET', sp?: Record<string, string | number>) => {
    return `/site${appendSp(sp)}`
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

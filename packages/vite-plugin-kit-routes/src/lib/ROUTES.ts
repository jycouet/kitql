export const PAGES = {
  _ROOT: (sp?: Record<string, string>) => {
    return `/${appendSp(sp)}`
  },
  contract: (sp?: Record<string, string>) => {
    return `/contract${appendSp(sp)}`
  },
  contract_id: (params: { id: string }, sp?: Record<string, string>) => {
    return `/contract/${params.id}${appendSp(sp)}`
  },
  site: (sp?: Record<string, string>) => {
    return `/site${appendSp(sp)}`
  },
  site_id: (params: { id: string }, sp?: Record<string, string>) => {
    return `/site/${params.id}${appendSp(sp)}`
  },
  site_contract_siteId_contractId: (
    params: { siteId: string; contractId: string },
    sp?: Record<string, string>,
  ) => {
    return `/site_contract/${params.siteId}-${params.contractId}${appendSp(sp)}`
  },
}

export const SERVERS = {
  contract: (method: 'GET' | 'POST', sp?: Record<string, string>) => {
    return `/contract${appendSp(sp)}`
  },
  site: (method: 'GET', sp?: Record<string, string>) => {
    return `/site${appendSp(sp)}`
  },
}

export const ACTIONS = {
  contract_id: (params: { id: string }) => {
    return `/contract/${params.id}`
  },
  site: (action: 'action1' | 'action2') => {
    return `/site?/${action}`
  },
  site_contract_siteId_contractId: (
    action: 'sendSomething',
    params: { siteId: string; contractId: string },
  ) => {
    return `/site_contract/${params.siteId}-${params.contractId}?/${action}`
  },
}

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return `?${new URLSearchParams(sp || {}).toString()}`
}

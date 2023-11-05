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
  site: (params?: { limit?: number }) => {
    return `/site${appendSp({ limit: params?.limit })}`
  },
  site_id: (params: { id: string | number; limit?: number }) => {
    return `/site/${params.id}${appendSp({ limit: params?.limit })}`
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

export const PAGES = {
  '/': (sp?: Record<string, string>) => {
    return `/${appendSp(sp)}`
  },
  '/site/[id]': (params: { id: string }, sp?: Record<string, string>) => {
    return `/site/${params.id}${appendSp(sp)}`
  },
  '/site/[param]/[yop]': (params: { param: string; yop: string }, sp?: Record<string, string>) => {
    return `/site/${params.param}/${params.yop}${appendSp(sp)}`
  },
}

export const SERVERS = {
  '/site/[id]/one': (
    method: 'GET' | 'POST',
    params: { id: string },
    sp?: Record<string, string>,
  ) => {
    return `/site/${params.id}/one${appendSp(sp)}`
  },
}

export const ACTIONS = {
  '/site/[id]/two': (params: { id: string }) => {
    return `/site/${params.id}/two`
  },
  '/site/[id]/two/[hello]': (
    action: 'default' | 'login' | 'register',
    params: { id: string; hello: string },
  ) => {
    return `/site/${params.id}/two/${params.hello}${
      String(action) === 'default' ? '' : `?/${action}`
    }`
  },
}

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return `?${new URLSearchParams(sp || {}).toString()}`
}

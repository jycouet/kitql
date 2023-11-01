export const PAGES = {
  '/': (sp?: Record<string, string>) => {
    return `/${appendSp(sp)}`
  },
  '/site/[id]': (id: string, sp?: Record<string, string>) => {
    return `/site/${id}${appendSp(sp)}`
  },
  '/site/[param]/[yop]': (param: string, yop: string, sp?: Record<string, string>) => {
    return `/site/${param}/${yop}${appendSp(sp)}`
  },
}

// TODO: SERVERS methods?
export const SERVERS = {
  '/site/[id]/one': (id: string, sp?: Record<string, string>) => {
    return `/site/${id}/one${appendSp(sp)}`
  },
}

// TODO: name actions
export const ACTIONS = {
  '/site/[id]/two/[hello]': (id: string, hello: string) => {
    return `/site/${id}/two/${hello}`
  },
}

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return `?${new URLSearchParams(sp || {}).toString()}`
}

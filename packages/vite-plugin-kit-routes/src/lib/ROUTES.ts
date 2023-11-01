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

export const SERVER_PAGES = {
  '/site/[id]/two/[hello]': (id: string, hello: string, sp?: Record<string, string>) => {
    return `/site/${id}/two/${hello}${appendSp(sp)}`
  },
}

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return `?${new URLSearchParams(sp || {}).toString()}`
}

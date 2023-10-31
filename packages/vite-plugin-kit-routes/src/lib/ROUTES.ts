export const ROUTES = {
  "/": (sp?: Record<string, string>) => { return `/${appendSp(sp)}` },
  "/site/[id]": (id: string, sp?: Record<string, string>) => { return `/site/${id}${appendSp(sp)}` },
  "/site/[param]/[yop]": (param: string, yop: string, sp?: Record<string, string>) => { return `/site/${param}/${yop}${appendSp(sp)}` }
}

const appendSp = (sp?: Record<string, string>) => {
  if (sp === undefined) return ''
  return `?${new URLSearchParams(sp || {}).toString()}`
}

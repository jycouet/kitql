export const format = (margin: { left?: number; top?: number; bottom?: number }, str: string) => {
  const m = {
    left: margin.left ?? 2,
    top: margin.top ?? 0,
    bottom: margin.bottom ?? 1,
  }

  if (str === '') return ''

  const strWithSpace = str
    .split('\n')
    .map((c) => `${Array(m.left).fill(' ').join('')}${c}`)
    .join('\n')

  return (
    `${Array(m.top).fill('\n').join('')}` +
    `${strWithSpace}` +
    `${Array(m.bottom).fill('\n').join('')}`
  )
}

export const appendSp = `type ParamValue = string | number | undefined

/**
 * Append search params to a string
 */
export const appendSp = (sp?: Record<string, ParamValue | ParamValue[]>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''

  const params = new URLSearchParams()
  const append = (n: string, v: ParamValue) => {
    if (v !== undefined) {
      params.append(n, String(v))
    }
  }

  for (const [name, val] of Object.entries(sp)) {
    if (Array.isArray(val)) {
      for (const v of val) {
        append(name, v)
      }
    } else {
      append(name, val)
    }
  }

  const formatted = params.toString()
  if (formatted) {
    return \`\${prefix}\${formatted}\`
  }
  return ''
}

/**
 * get the current search params
 * 
 * Could be use like this:
 * \`\`\`
 * route("/cities", { page: 2 }, { ...currentSP() })
 * \`\`\`
 */ 
export const currentSp = () => {
  const params = new URLSearchParams(window.location.search)
  const record: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    record[key] = value
  }
  return record
}

function StringOrUndefined(val: any) {
  if (val === undefined) {
    return undefined
  }

  return String(val)
}`

export const routeFn = `// route function helpers
type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
type AllTypes = typeof AllObjs

export type AllRoutes<T = AllTypes, K = keyof T> = K extends \`\${infer I1} \${infer I2}\` ? I2 : K
export const allRoutes = [... new Set(Object.keys(AllObjs).map((k) => /^\\/.*|[^ ]?\\/.*$/.exec(k)?.[0] ?? null))]

/**
 * To be used like this: 
 * \`\`\`ts
 * import { route } from '$lib/ROUTES'
 * 
 * route('site_id', { id: 1 })
 * \`\`\`
 */
export function route<T extends FunctionKeys<AllTypes>>(key: T, ...params: FunctionParams<AllTypes[T]>): string
export function route<T extends NonFunctionKeys<AllTypes>>(key: T): string
export function route<T extends keyof AllTypes>(key: T, ...params: any[]): string {
  if (AllObjs[key] as any instanceof Function) {
    const element = (AllObjs as any)[key] as (...args: any[]) => string
    return element(...params)
  } else {
    return AllObjs[key] as string
  }
}`

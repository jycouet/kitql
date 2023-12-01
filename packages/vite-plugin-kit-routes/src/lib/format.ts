export const format = (margin: { left?: number; top?: number; bottom?: number }, str: string) => {
  const m = {
    left: margin.left ?? 2,
    top: margin.top ?? 0,
    bottom: margin.bottom ?? 1,
  }

  if (str === '') return ''

  const strWithSpace = str
    .split('\n')
    .map(c => `${Array(m.left).fill(' ').join('')}${c}`)
    .join('\n')

  return (
    `${Array(m.top).fill('\n').join('')}` +
    `${strWithSpace}` +
    `${Array(m.bottom).fill('\n').join('')}`
  )
}

export const appendSp = `/**
 * Append search params to a string
 */
const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''
  const mapping = Object.entries(sp)
    .filter(c => c[1] !== undefined)
    .map(c => [c[0], String(c[1])])

  const formated = new URLSearchParams(mapping).toString()
  if (formated) {
    return \`\${prefix}\${formated}\`
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
}`

export const routeFn = `// route function helpers
type NonFunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T]
type FunctionKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
type FunctionParams<T> = T extends (...args: infer P) => any ? P : never

const AllObjs = { ...PAGES, ...ACTIONS, ...SERVERS, ...LINKS }
type AllTypes = typeof AllObjs

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

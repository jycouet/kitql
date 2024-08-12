
/**
 * A type that represents an allowed origin definition.
 */
export type AllowedOrigin = boolean | string | RegExp | Array<string | RegExp>

export function isOriginAllowed(requestOrigin: string, origin: AllowedOrigin): boolean {
  if (Array.isArray(origin)) {
    for (const originPattern of origin) {
      if (isOriginAllowed(requestOrigin, originPattern)) {
        return true
      }
    }
    return false
  }
  if (typeof origin === 'string') {
    return requestOrigin === origin
  }
  if (origin instanceof RegExp) {
    return origin.test(requestOrigin)
  }
  return !!origin
}


/**
 * A type that represents an allowed origin definition.
 *
 * An allowed origin can be:
 * - `true` to allow all origins
 * - `false` to disallow all origins
 * - a string to allow a specific origin
 * - a regular expression to allow origins that match the pattern
 * - an array of strings and/or regular expressions to allow multiple origins that match any of the
 *   entries in the array
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
